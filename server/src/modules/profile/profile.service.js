import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import mongoose from "mongoose";
import Friend from "../friend/friend.model.js";
import { createNotificationService } from "../notification/notification.service.js";

// PROFILE COMPLETION DETAILS
export const calculateProfileCompletionDetails = (user) => {
  const fields = [
    { key: "name", label: "Name", check: (u) => !!(u.name && u.name.trim()) },
    { key: "profileImage", label: "Profile Image", check: (u) => !!u.profileImage },
    { key: "bio", label: "Bio", check: (u) => !!(u.bio && u.bio.trim()) },
    { key: "location", label: "Location", check: (u) => !!(u.location && u.location.trim()) },
    { key: "travelStyle", label: "Travel Style", check: (u) => !!(u.travelStyle && u.travelStyle.trim()) },
    { key: "interests", label: "Interests", check: (u) => !!(u.interests && u.interests.length > 0) },
    { key: "languages", label: "Languages", check: (u) => !!(u.languages && u.languages.length > 0) },
    { key: "visitedPlaces", label: "Visited Places", check: (u) => !!(u.visitedPlaces && u.visitedPlaces.length > 0) },
    { key: "personality", label: "Personality", check: (u) => !!(u.personality && u.personality.trim()) },
    { key: "destinationPreference", label: "Destination Preference", check: (u) => !!(u.destinationPreference && u.destinationPreference.trim()) },
    { key: "social", label: "Social Links", check: (u) => !!((u.instagram && u.instagram.trim()) || (u.website && u.website.trim()) || (u.github && u.github.trim()) || (u.linkedin && u.linkedin.trim())) },
  ];

  const completed = fields.filter(f => f.check(user));
  const missing = fields.filter(f => !f.check(user)).map(f => f.label);
  const percentage = Math.round((completed.length / fields.length) * 100);

  return {
    percentage,
    missingFields: missing,
  };
};

// TRUST SCORE CALCULATION
export const calculateTrustScore = (user, stats) => {
  let score = 10; // Base score
  if (user.isVerified) score += 20;
  if (user.profileImage) score += 15;
  if (user.bio && user.bio.trim() !== "") score += 10;
  if (user.location && user.location.trim() !== "") score += 5;
  
  const hasSocial = user.instagram || user.website || user.github || user.linkedin;
  if (hasSocial) score += 5;

  score += Math.min(10, (user.friends?.length || 0) * 2);
  score += Math.min(15, (stats.tripsCreated || 0) * 5);
  score += Math.min(15, (stats.tripsJoined || 0) * 5);

  if (stats.reviewsCount > 0) {
    const totalRating = stats.reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = totalRating / stats.reviewsCount;
    if (average >= 4.0) score += 10;
    else if (average >= 3.0) score += 5;
  }

  return Math.min(100, score);
};

// HELPER FOR PROFILE STATS
export const computeStatsObj = async (user, userId) => {
  const [tripsCreated, tripsJoined, reviews] = await Promise.all([
    Trip.countDocuments({ createdBy: userId }),
    Trip.countDocuments({ members: userId }),
    Review.find({ reviewFor: userId }),
  ]);

  const completionDetails = calculateProfileCompletionDetails(user);
  const trustScore = calculateTrustScore(user, {
    tripsCreated,
    tripsJoined,
    reviewsCount: reviews.length,
    reviews,
  });

  return {
    friendsCount: user.friends?.length || 0,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    tripsCreated,
    tripsJoined,
    reviewsCount: reviews.length,
    trustScore,
    profileCompletion: completionDetails.percentage,
    missingFields: completionDetails.missingFields,
  };
};

// GET PROFILE
export const getProfileService = async (userId, simple = false) => {
  if (simple) {
    const user = await User.findById(userId).select("name email profileImage travelStyle isVerified following followers");
    if (!user) {
      throw new Error("User not found");
    }
    return user.toObject();
  }

  const user = await User.findById(userId)
    .select("-password")
    .populate("friends", "name profileImage")
    .populate("followers", "name profileImage")
    .populate("following", "name profileImage");

  if (!user) {
    throw new Error("User not found");
  }

  const stats = await computeStatsObj(user, userId);

  return {
    ...user.toObject(),
    stats,
    profileCompletion: stats.profileCompletion,
  };
};

// UPDATE PROFILE
export const updateProfileService = async (userId, data) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  )
    .select("-password")
    .populate("friends", "name profileImage")
    .populate("followers", "name profileImage")
    .populate("following", "name profileImage");

  if (!updatedUser) {
    throw new Error("User not found");
  }

  const stats = await computeStatsObj(updatedUser, userId);

  await User.findByIdAndUpdate(userId, {
    $set: {
      trustScore: stats.trustScore || 10,
      profileCompletion: stats.profileCompletion || 0,
      followersCount: stats.followersCount || 0,
      followingCount: stats.followingCount || 0,
    }
  });

  return {
    ...updatedUser.toObject(),
    stats,
    profileCompletion: stats.profileCompletion,
    trustScore: stats.trustScore,
    followersCount: stats.followersCount,
    followingCount: stats.followingCount,
  };
};

// PUBLIC PROFILE
export const getPublicProfileService = async (userId, currentUserId = null) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("friends", "name profileImage")
    .populate("followers", "name profileImage")
    .populate("following", "name profileImage");

  if (!user) {
    throw new Error("User not found");
  }

  const [stats, recentTrips, recentReviews] = await Promise.all([
    computeStatsObj(user, userId),
    Trip.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    })
      .select("title destination startDate endDate budget image status")
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(3),
    Review.find({ reviewFor: userId })
      .populate("reviewer", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(3)
  ]);

  let isFollowing = false;
  if (currentUserId) {
    const currentUser = await User.findById(currentUserId).select("following");
    if (currentUser && currentUser.following) {
      isFollowing = currentUser.following.some(
        (id) => id.toString() === userId.toString()
      );
    }
  }

  return {
    ...user.toObject(),
    stats,
    profileCompletion: stats.profileCompletion,
    recentTrips,
    recentReviews,
    isFollowing,
  };
};

// FOLLOW USER SERVICE
export const followUserService = async (userId, targetId) => {
  if (userId.toString() === targetId.toString()) {
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new Error("User to follow not found");
  }

  const currentUser = await User.findById(userId).select("following name");
  if (!currentUser) {
    throw new Error("Current user not found");
  }

  // Prevent duplicates
  const alreadyFollowing = currentUser.following.some(
    (id) => id.toString() === targetId.toString()
  );
  if (alreadyFollowing) {
    throw new Error("You are already following this user");
  }

  // Update databases
  await Promise.all([
    User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } }),
    User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } }),
  ]);

  // Update cached stats for both users
  await Promise.all([
    updateUserStatsCache(userId),
    updateUserStatsCache(targetId)
  ]);

  // Create notification
  await createNotificationService(
    targetId,
    `${currentUser.name} started following you. 👤`,
    "follow",
    `/profile/${userId}`,
    userId
  );

  return { success: true };
};

// UNFOLLOW USER SERVICE
export const unfollowUserService = async (userId, targetId) => {
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new Error("User to unfollow not found");
  }

  const currentUser = await User.findById(userId).select("following");
  if (!currentUser) {
    throw new Error("Current user not found");
  }

  const isFollowing = currentUser.following.some(
    (id) => id.toString() === targetId.toString()
  );
  if (!isFollowing) {
    throw new Error("You are not following this user");
  }

  // Update databases
  await Promise.all([
    User.findByIdAndUpdate(userId, { $pull: { following: targetId } }),
    User.findByIdAndUpdate(targetId, { $pull: { followers: userId } }),
  ]);

  // Update cached stats for both users
  await Promise.all([
    updateUserStatsCache(userId),
    updateUserStatsCache(targetId)
  ]);

  return { success: true };
};

// GET FOLLOWERS LIST SERVICE
export const getFollowersService = async (userId) => {
  const user = await User.findById(userId)
    .populate("followers", "name profileImage travelStyle isVerified stats")
    .select("followers");

  if (!user) {
    throw new Error("User not found");
  }

  return user.followers || [];
};

// GET FOLLOWING LIST SERVICE
export const getFollowingService = async (userId) => {
  const user = await User.findById(userId)
    .populate("following", "name profileImage travelStyle isVerified stats")
    .select("following");

  if (!user) {
    throw new Error("User not found");
  }

  return user.following || [];
};

// CENTRALIZED STATS CACHE UPDATE HELPER
export const updateUserStatsCache = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    const stats = await computeStatsObj(user, userId);
    await User.findByIdAndUpdate(userId, {
      $set: {
        trustScore: stats.trustScore || 10,
        profileCompletion: stats.profileCompletion || 0,
        followersCount: stats.followersCount || 0,
        followingCount: stats.followingCount || 0,
      }
    });
  } catch (err) {
    console.error(`Failed to update user stats cache for ${userId}:`, err.message);
  }
};

// GET DISCOVER TRAVELERS SERVICE (PHASE 4)
export const getDiscoverTravelersService = async (params, currentUserId) => {
  const {
    query,
    page = 1,
    limit = 10,
    travelStyle,
    personality,
    destinationPreference,
    minTrustScore,
    minCompletion,
    minFollowers,
    minFollowing,
    sortBy = "relevance"
  } = params;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  // 1. MATCH FILTER
  const matchStage = {};

  // Exclude current user from discovery list
  if (currentUserId) {
    matchStage._id = { $ne: new mongoose.Types.ObjectId(currentUserId) };
  }

  // Text/Regex matching on search query
  if (query) {
    const cleanQuery = query.trim();
    matchStage.$or = [
      { name: { $regex: cleanQuery, $options: "i" } },
      { interests: { $regex: cleanQuery, $options: "i" } },
      { travelStyle: { $regex: cleanQuery, $options: "i" } },
      { personality: { $regex: cleanQuery, $options: "i" } },
      { destinationPreference: { $regex: cleanQuery, $options: "i" } }
    ];
  }

  // Exact or pattern match filters
  if (travelStyle) {
    matchStage.travelStyle = { $regex: travelStyle, $options: "i" };
  }
  if (personality) {
    matchStage.personality = { $regex: personality, $options: "i" };
  }
  if (destinationPreference) {
    matchStage.destinationPreference = { $regex: destinationPreference, $options: "i" };
  }

  // Numeric range filters on cached stats
  if (minTrustScore) {
    matchStage.trustScore = { $gte: parseInt(minTrustScore, 10) };
  }
  if (minCompletion) {
    matchStage.profileCompletion = { $gte: parseInt(minCompletion, 10) };
  }
  if (minFollowers) {
    matchStage.followersCount = { $gte: parseInt(minFollowers, 10) };
  }
  if (minFollowing) {
    matchStage.followingCount = { $gte: parseInt(minFollowing, 10) };
  }

  // 2. RELEVANCE SORT / ADD FIELDS STAGE
  const pipeline = [{ $match: matchStage }];

  // Relevance logic ranking:
  // Exact Name match: 100, Interest match: 80, travelStyle: 60, destination: 40, personality: 20
  if (query) {
    const cleanQuery = query.trim();
    pipeline.push({
      $addFields: {
        relevanceScore: {
          $add: [
            {
              $cond: {
                if: { $regexMatch: { input: "$name", regex: `^${cleanQuery}$`, options: "i" } },
                then: 100,
                else: 0
              }
            },
            {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: { $ifNull: ["$interests", []] },
                          as: "interest",
                          cond: { $regexMatch: { input: "$$interest", regex: cleanQuery, options: "i" } }
                        }
                      }
                    },
                    0
                  ]
                },
                then: 80,
                else: 0
              }
            },
            {
              $cond: {
                if: { $regexMatch: { input: { $ifNull: ["$travelStyle", ""] }, regex: cleanQuery, options: "i" } },
                then: 60,
                else: 0
              }
            },
            {
              $cond: {
                if: { $regexMatch: { input: { $ifNull: ["$destinationPreference", ""] }, regex: cleanQuery, options: "i" } },
                then: 40,
                else: 0
              }
            },
            {
              $cond: {
                if: { $regexMatch: { input: { $ifNull: ["$personality", ""] }, regex: cleanQuery, options: "i" } },
                then: 20,
                else: 0
              }
            }
          ]
        }
      }
    });
  } else {
    pipeline.push({
      $addFields: {
        relevanceScore: 0
      }
    });
  }

  // 3. SORT STAGE
  const sortStage = {};
  if (sortBy === "relevance" && query) {
    sortStage.relevanceScore = -1;
    sortStage.trustScore = -1;
  } else if (sortBy === "followed") {
    sortStage.followersCount = -1;
  } else if (sortBy === "trust") {
    sortStage.trustScore = -1;
  } else if (sortBy === "newest") {
    sortStage.createdAt = -1;
  } else if (sortBy === "active") {
    sortStage.totalTrips = -1;
  } else if (sortBy === "completion") {
    sortStage.profileCompletion = -1;
  } else {
    // Default fallback
    sortStage.trustScore = -1;
  }
  pipeline.push({ $sort: sortStage });

  // 4. FACET PAGINATION (Single round-trip for data and count metadata)
  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $skip: skipNum },
        { $limit: limitNum },
        {
          $project: {
            password: 0,
            email: 0,
            resetOTP: 0,
            resetOTPExpire: 0,
            friends: 0,
            followers: 0,
            following: 0,
          }
        }
      ]
    }
  });

  const aggregationResult = await User.aggregate(pipeline);
  const facetResult = aggregationResult[0] || { metadata: [], data: [] };

  const totalResults = facetResult.metadata[0]?.total || 0;
  const travelers = facetResult.data || [];
  const totalPages = Math.ceil(totalResults / limitNum);

  // 5. ATOMIC FOLLOW STATE POPULATOR (O(1) checks using requester follow lists)
  let currentUserFollowing = [];
  if (currentUserId) {
    const curUser = await User.findById(currentUserId).select("following");
    if (curUser && curUser.following) {
      currentUserFollowing = curUser.following.map((id) => id.toString());
    }
  }

  const enhancedTravelers = travelers.map((trav) => ({
    ...trav,
    isFollowing: currentUserFollowing.includes(trav._id.toString())
  }));

  return {
    travelers: enhancedTravelers,
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalResults,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1
  };
};