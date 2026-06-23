import mongoose from "mongoose";
import Friend from "./friend.model.js";
import User from "../auth/auth.model.js";
import {
  createNotificationService,
} from "../notification/notification.service.js";
import { updateUserStatsCache } from "../profile/profile.service.js";

// ==========================================
// MATCH ENGINE / SCORE CALCULATION UTILITY
// ==========================================

export const calculateMatchScore = (userA, userB) => {
  let score = 0;

  // 1. Shared Interests (+10 each, max +40)
  if (userA.interests && userB.interests) {
    const commonInterests = userA.interests.filter(interest =>
      userB.interests.some(item => item.trim().toLowerCase() === interest.trim().toLowerCase())
    );
    score += Math.min(commonInterests.length * 10, 40);
  }

  // 2. Same Travel Style (+25)
  if (
    userA.travelStyle &&
    userB.travelStyle &&
    userA.travelStyle.trim().toLowerCase() === userB.travelStyle.trim().toLowerCase()
  ) {
    score += 25;
  }

  // 3. Same Destination Preference (+20)
  if (
    userA.destinationPreference &&
    userB.destinationPreference &&
    userA.destinationPreference.trim().toLowerCase() === userB.destinationPreference.trim().toLowerCase()
  ) {
    score += 20;
  }

  // 4. High Trust Score (+10 max)
  const trust = userB.trustScore || 10;
  score += Math.round(trust / 10);

  // 5. Following Relationship (+5 if userA follows userB)
  if (userA.following && userA.following.some(id => id.toString() === userB._id.toString())) {
    score += 5;
  }

  return Math.min(score, 100);
};

// ========================
// SEND FRIEND REQUEST
// ========================

export const sendFriendRequestService =
  async (
    sender,
    receiver
  ) => {

    if (
      sender.toString() ===
      receiver.toString()
    ) {

      throw new Error(
        "You cannot send a friend request to yourself"
      );

    }

    const senderUser =
      await User.findById(
        sender
      );

    const receiverUser =
      await User.findById(
        receiver
      );

    if (
      !senderUser ||
      !receiverUser
    ) {

      throw new Error(
        "User not found"
      );

    }

    const existing =
      await Friend.findOne({

        $or: [

          {
            sender,
            receiver,
          },

          {
            sender:
              receiver,

            receiver:
              sender,
          },

        ],

      });

    if (existing) {
      if (existing.status === "accepted") {
        throw new Error("You are already friends with this user");
      }
      throw new Error(
        "Friend request already exists"
      );

    }

    const request =
      await Friend.create({

        sender,

        receiver,

        status:
          "pending",

      });

    // NOTIFICATION

    await createNotificationService(

      receiver,

      `${senderUser.name} sent you a friend request 🤝`,

      "friend",

      "/friends",

      sender

    );

    return request;

};

// ========================
// ACCEPT REQUEST
// ========================

export const acceptFriendRequestService =
  async (requestId, userId) => {

    const request =
      await Friend.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    if (request.receiver.toString() !== userId.toString()) {
      throw new Error(
        "Not authorized to accept this request"
      );
    }

    if (
      request.status ===
      "accepted"
    ) {

      throw new Error(
        "Already accepted"
      );

    }

    request.status =
      "accepted";

    await request.save();

    await User.findByIdAndUpdate(

      request.sender,

      {

        $addToSet: {

          friends:
            request.receiver,

          following:
            request.receiver,

        },

      }

    );

    await User.findByIdAndUpdate(

      request.receiver,

      {

        $addToSet: {

          friends:
            request.sender,

          followers:
            request.sender,

        },

      }

    );

    // Update cached stats for both users
    await Promise.all([
      updateUserStatsCache(request.sender),
      updateUserStatsCache(request.receiver),
    ]);

    const receiver =
      await User.findById(
        request.receiver
      );

    // NOTIFICATION

    await createNotificationService(

      request.sender,

      `${receiver.name} accepted your friend request 🎉`,

      "friend",

      "/friends",

      request.receiver

    );

    return await Friend.findById(
      requestId
    )

      .populate(
        "sender",
        "name email profileImage"
      )

      .populate(
        "receiver",
        "name email profileImage"
      );

};

// ========================
// REJECT REQUEST
// ========================

export const rejectFriendRequestService =
  async (requestId, userId) => {

    const request =
      await Friend.findById(
        requestId
      );

    if (!request) {

      throw new Error(
        "Request not found"
      );

    }

    if (request.receiver.toString() !== userId.toString()) {
      throw new Error(
        "Not authorized to reject this request"
      );
    }

    request.status =
      "rejected";

    await request.save();

    return request;

};

// ========================
// CANCEL REQUEST (NEW)
// ========================

export const cancelFriendRequestService =
  async (requestId, userId) => {

    const request =
      await Friend.findById(
        requestId
      );

    if (!request) {
      throw new Error(
        "Request not found"
      );
    }

    if (request.sender.toString() !== userId.toString()) {
      throw new Error(
        "Not authorized to cancel this request"
      );
    }

    if (request.status !== "pending") {
      throw new Error(
        "Only pending requests can be cancelled"
      );
    }

    await Friend.findByIdAndDelete(requestId);

    return { success: true };
};

// ========================
// REMOVE FRIEND (NEW)
// ========================

export const removeFriendService =
  async (userId, friendId) => {

    const request = await Friend.findOne({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ],
      status: "accepted"
    });

    if (!request) {
      throw new Error("Friendship not found");
    }

    await Friend.findByIdAndDelete(request._id);

    await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } }
    );

    await User.findByIdAndUpdate(
      friendId,
      { $pull: { friends: userId } }
    );

    // Update cached stats for both users
    await Promise.all([
      updateUserStatsCache(userId),
      updateUserStatsCache(friendId)
    ]);

    return { success: true };
};

// ========================
// GET FRIENDS (PAGINATED & SEARCHABLE)
// ========================

export const getFriendsService =
  async (userId, params = {}) => {
    const { query, page = 1, limit = 10 } = params;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch all accepted Friend docs for this user
    const friendDocs = await Friend.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
      status: "accepted",
    });

    // Extract friend IDs
    const friendIds = friendDocs.map(doc =>
      doc.sender.toString() === userId.toString() ? doc.receiver : doc.sender
    );

    // Query details of these users, applying search filter
    const userMatch = {
      _id: { $in: friendIds }
    };

    if (query) {
      const cleanQuery = query.trim();
      userMatch.$or = [
        { name: { $regex: cleanQuery, $options: "i" } },
        { interests: { $regex: cleanQuery, $options: "i" } },
        { travelStyle: { $regex: cleanQuery, $options: "i" } }
      ];
    }

    const totalResults = await User.countDocuments(userMatch);
    const totalPages = Math.ceil(totalResults / limitNum);

    const friendsList = await User.find(userMatch)
      .select("name email profileImage travelStyle destinationPreference interests trustScore followersCount followingCount followers following totalTrips profileCompletion isVerified")
      .sort({ name: 1 })
      .skip(skipNum)
      .limit(limitNum);

    const currentUser = await User.findById(userId);
    const enhancedFriends = friendsList.map(friend => {
      const friendObj = friend.toObject();
      const matchScore = calculateMatchScore(currentUser, friendObj);
      const doc = friendDocs.find(d => 
        (d.sender.toString() === userId.toString() && d.receiver.toString() === friend._id.toString()) ||
        (d.receiver.toString() === userId.toString() && d.sender.toString() === friend._id.toString())
      );
      return {
        ...friendObj,
        matchScore,
        friendshipId: doc ? doc._id : null
      };
    });

    return {
      friends: enhancedFriends,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1
    };
};

// ========================
// GET PENDING RECEIVED REQUESTS
// ========================

export const getPendingRequestsService =
  async (userId, params = {}) => {
    const { query, page = 1, limit = 10 } = params;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch pending request documents received by this user
    const requestDocs = await Friend.find({
      receiver: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    const senderIds = requestDocs.map(doc => doc.sender);

    const userMatch = {
      _id: { $in: senderIds }
    };

    if (query) {
      const cleanQuery = query.trim();
      userMatch.$or = [
        { name: { $regex: cleanQuery, $options: "i" } },
        { interests: { $regex: cleanQuery, $options: "i" } },
        { travelStyle: { $regex: cleanQuery, $options: "i" } }
      ];
    }

    const totalResults = await User.countDocuments(userMatch);
    const totalPages = Math.ceil(totalResults / limitNum);

    const sendersList = await User.find(userMatch)
      .select("name email profileImage travelStyle destinationPreference interests trustScore followersCount followingCount followers following totalTrips profileCompletion isVerified")
      .skip(skipNum)
      .limit(limitNum);

    const currentUser = await User.findById(userId);
    const enhancedRequests = sendersList.map(sender => {
      const senderObj = sender.toObject();
      const matchScore = calculateMatchScore(currentUser, senderObj);
      const doc = requestDocs.find(d => d.sender.toString() === sender._id.toString());
      return {
        _id: doc ? doc._id : null,
        sender: senderObj,
        matchScore
      };
    });

    return {
      requests: enhancedRequests,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1
    };
};

// ========================
// GET SENT REQUESTS
// ========================

export const getSentRequestsService =
  async (userId, params = {}) => {
    const { query, page = 1, limit = 10 } = params;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch pending request documents sent by this user
    const requestDocs = await Friend.find({
      sender: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    const receiverIds = requestDocs.map(doc => doc.receiver);

    const userMatch = {
      _id: { $in: receiverIds }
    };

    if (query) {
      const cleanQuery = query.trim();
      userMatch.$or = [
        { name: { $regex: cleanQuery, $options: "i" } },
        { interests: { $regex: cleanQuery, $options: "i" } },
        { travelStyle: { $regex: cleanQuery, $options: "i" } }
      ];
    }

    const totalResults = await User.countDocuments(userMatch);
    const totalPages = Math.ceil(totalResults / limitNum);

    const receiversList = await User.find(userMatch)
      .select("name email profileImage travelStyle destinationPreference interests trustScore followersCount followingCount followers following totalTrips profileCompletion isVerified")
      .skip(skipNum)
      .limit(limitNum);

    const currentUser = await User.findById(userId);
    const enhancedRequests = receiversList.map(receiver => {
      const receiverObj = receiver.toObject();
      const matchScore = calculateMatchScore(currentUser, receiverObj);
      const doc = requestDocs.find(d => d.receiver.toString() === receiver._id.toString());
      return {
        _id: doc ? doc._id : null,
        receiver: receiverObj,
        matchScore,
        status: "pending"
      };
    });

    return {
      requests: enhancedRequests,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1
    };
};

// ========================
// GET SUGGESTED TRAVELERS
// ========================

export const getSuggestedTravelersService =
  async (userId, params = {}) => {
    const { query, page = 1, limit = 10 } = params;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Get all relations (accepted, pending, rejected) for the user to exclude them from suggestions
    const relations = await Friend.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    const relatedUserIds = relations.map(doc =>
      doc.sender.toString() === userId.toString() ? doc.receiver.toString() : doc.sender.toString()
    );

    // Build user match criteria
    const userMatch = {
      _id: {
        $nin: [
          ...relatedUserIds.map(id => new mongoose.Types.ObjectId(id)),
          new mongoose.Types.ObjectId(userId)
        ]
      }
    };

    if (query) {
      const cleanQuery = query.trim();
      userMatch.$or = [
        { name: { $regex: cleanQuery, $options: "i" } },
        { interests: { $regex: cleanQuery, $options: "i" } },
        { travelStyle: { $regex: cleanQuery, $options: "i" } }
      ];
    }

    const candidates = await User.find(userMatch)
      .select("name email profileImage travelStyle destinationPreference interests trustScore followersCount followingCount followers following totalTrips profileCompletion isVerified");

    const currentUser = await User.findById(userId);

    const suggestions = candidates.map(candidate => {
      const candidateObj = candidate.toObject();
      const score = calculateMatchScore(currentUser, candidateObj);
      const isFollowing = currentUser.following && currentUser.following.some(
        id => id.toString() === candidate._id.toString()
      );
      return {
        ...candidateObj,
        matchScore: score,
        isFollowing
      };
    });

    // Sort matching priority:
    // 1. Highest Shared Match Score
    // 2. Higher trust score
    // 3. Active users (represented by totalTrips)
    // 4. Profile Completion
    suggestions.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      if (b.trustScore !== a.trustScore) {
        return b.trustScore - a.trustScore;
      }
      const tripsB = b.totalTrips || 0;
      const tripsA = a.totalTrips || 0;
      if (tripsB !== tripsA) {
        return tripsB - tripsA;
      }
      return (b.profileCompletion || 0) - (a.profileCompletion || 0);
    });

    const totalResults = suggestions.length;
    const totalPages = Math.ceil(totalResults / limitNum);
    const paginatedSuggestions = suggestions.slice(skipNum, skipNum + limitNum);

    return {
      travelers: paginatedSuggestions,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1
    };
};