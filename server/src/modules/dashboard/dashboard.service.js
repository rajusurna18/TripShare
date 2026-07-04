import mongoose from "mongoose";
import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import Expense from "../expense/expense.model.js";
import Friend from "../friend/friend.model.js";
import Notification from "../notification/notification.model.js";
import Memory from "../memory/memory.model.js";
import Blog from "../blog/blog.model.js";
import { calculateTrustScore } from "../profile/profile.service.js";

export const getDashboardStatsService = async (userId) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const [
    tripsCreated,
    tripsJoined,
    totalFriends,
    pendingRequests,
    reviews,
    totalMemories,
    unreadNotifications,
    expenseResult,
    totalBlogs,
    latestBlog,
    popularBlog,
    mostViewedBlog,
    recentDraft,

    // LATEST WIDGETS
    latestTrip,
    latestFriendDoc,
    latestReview,
    latestMemory,

    // TREND CHARTS AGGREGATIONS
    tripsTrendCreated,
    tripsTrendJoined,
    expenseCategoryStats,
    expenseMonthlyTrend,
    memoriesMonthlyTrend,
    reviewsWrittenTrend
  ] = await Promise.all([

    Trip.countDocuments({
      createdBy: userId,
    }),

    Trip.countDocuments({
      members: userId,
    }),

    Friend.countDocuments({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
      status: "accepted",
    }),

    Friend.countDocuments({
      receiver: userId,
      status: "pending",
    }),

    Review.find({
      reviewFor: userId,
    }),

    Memory.countDocuments({
      user: userId,
    }),

    Notification.countDocuments({
      user: userId,
      read: false,
    }),

    Expense.aggregate([
      {
        $match: {
          paidBy: user._id,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Blog.countDocuments({
      author: userId,
    }),

    Blog.findOne({ author: userId }).sort({ createdAt: -1 }),
    Blog.findOne({ author: userId }).sort({ likesCount: -1, createdAt: -1 }),
    Blog.findOne({ author: userId }).sort({ viewsCount: -1, createdAt: -1 }),
    Blog.findOne({ author: userId, visibility: "private" }).sort({ createdAt: -1 }),

    // LATEST TRIP WIDGET
    Trip.findOne({
      $or: [{ createdBy: userId }, { members: userId }]
    }).sort({ createdAt: -1 }).populate("createdBy", "name profileImage"),

    // LATEST FRIEND
    Friend.findOne({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted"
    }).sort({ updatedAt: -1 }).populate("sender receiver", "name profileImage"),

    // LATEST REVIEW
    Review.findOne({
      reviewFor: userId
    }).sort({ createdAt: -1 }).populate("createdBy", "name profileImage").populate("trip", "title destination"),

    // LATEST MEMORY
    Memory.findOne({
      user: userId
    }).sort({ createdAt: -1 }).populate("trip", "title destination"),

    // TRIPS CREATED MONTHLY TREND
    Trip.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // TRIPS JOINED MONTHLY TREND
    Trip.aggregate([
      { $match: { members: new mongoose.Types.ObjectId(userId), createdBy: { $ne: new mongoose.Types.ObjectId(userId) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // EXPENSE CATEGORY STATS
    Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          value: { $sum: "$amount" }
        }
      }
    ]),

    // EXPENSE MONTHLY TREND
    Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // MEMORIES MONTHLY TREND
    Memory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // REVIEWS WRITTEN TREND
    Review.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

  ]);

  const totalReviews = reviews.length;

  const trustScore = calculateTrustScore(user, {
    tripsCreated,
    tripsJoined,
    reviewsCount: totalReviews,
    reviews,
  });

  const totalExpenses =
    expenseResult[0]?.total || 0;

  // Resolve Latest Friend Name & Avatar relative to User ID
  let resolvedLatestFriend = null;
  if (latestFriendDoc) {
    const isSender = latestFriendDoc.sender?._id.toString() === userId.toString();
    resolvedLatestFriend = isSender ? latestFriendDoc.receiver : latestFriendDoc.sender;
  }

  return {
    tripsCreated,
    tripsJoined,
    totalFriends,
    pendingRequests,
    totalReviews,
    trustScore,
    totalExpenses,
    totalMemories,
    unreadNotifications,
    totalBlogs,
    widgets: {
      latestBlog,
      popularBlog,
      mostViewedBlog,
      recentDraft,
      latestTrip,
      latestFriend: resolvedLatestFriend,
      latestReview,
      latestMemory
    },
    analytics: {
      tripsTrendCreated,
      tripsTrendJoined,
      expenseCategoryStats,
      expenseMonthlyTrend,
      memoriesMonthlyTrend,
      reviewsWrittenTrend
    }
  };
};