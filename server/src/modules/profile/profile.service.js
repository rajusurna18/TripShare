import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import Friend from "../friend/friend.model.js";

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
const computeStatsObj = async (user, userId) => {
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
    const user = await User.findById(userId).select("name email profileImage travelStyle isVerified");
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

  return {
    ...updatedUser.toObject(),
    stats,
    profileCompletion: stats.profileCompletion,
  };
};

// PUBLIC PROFILE
export const getPublicProfileService = async (userId) => {
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

  return {
    ...user.toObject(),
    stats,
    profileCompletion: stats.profileCompletion,
    recentTrips,
    recentReviews,
  };
};