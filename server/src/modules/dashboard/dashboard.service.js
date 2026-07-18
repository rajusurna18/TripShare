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
    latestTrip,
    latestFriendDoc,
    latestReview,
    latestMemory,
    tripsTrendResult,
    expenseFacetResult,
    blogFacetResult,
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
    }).select("rating").lean(),

    Memory.countDocuments({
      user: userId,
    }),

    Notification.countDocuments({
      user: userId,
      read: false,
    }),

    // LATEST TRIP WIDGET
    Trip.findOne({
      $or: [{ createdBy: userId }, { members: userId }]
    }).sort({ createdAt: -1 }).populate("createdBy", "name profileImage").lean(),

    // LATEST FRIEND
    Friend.findOne({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted"
    }).sort({ updatedAt: -1 }).populate("sender receiver", "name profileImage").lean(),

    // LATEST REVIEW
    Review.findOne({
      reviewFor: userId
    }).sort({ createdAt: -1 }).populate("createdBy", "name profileImage").populate("trip", "title destination").lean(),

    // LATEST MEMORY
    Memory.findOne({
      user: userId
    }).sort({ createdAt: -1 }).populate("trip", "title destination").lean(),

    // COMBINED TRIP MONTHLY TRENDS (Created + Joined)
    Trip.aggregate([
      {
        $match: {
          $or: [
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { members: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          createdCount: {
            $sum: {
              $cond: [
                { $eq: ["$createdBy", new mongoose.Types.ObjectId(userId)] },
                1,
                0
              ]
            }
          },
          joinedCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: [new mongoose.Types.ObjectId(userId), "$members"] },
                    { $ne: ["$createdBy", new mongoose.Types.ObjectId(userId)] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // EXPENSE FACET AGGREGATION
    Expense.aggregate([
      { $match: { paidBy: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          totalExpense: [
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],
          categoryStats: [
            {
              $group: {
                _id: "$category",
                value: { $sum: "$amount" }
              }
            }
          ],
          monthlyTrend: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                amount: { $sum: "$amount" }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]),

    // BLOG FACET AGGREGATION
    Blog.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          count: [
            { $count: "count" }
          ],
          latest: [
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          popular: [
            { $sort: { likesCount: -1, createdAt: -1 } },
            { $limit: 1 }
          ],
          mostViewed: [
            { $sort: { viewsCount: -1, createdAt: -1 } },
            { $limit: 1 }
          ],
          recentDraft: [
            { $match: { visibility: "private" } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ]
        }
      }
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

  const expenseFacet = expenseFacetResult?.[0] || {};
  const totalExpenses = expenseFacet.totalExpense?.[0]?.total || 0;
  const expenseCategoryStats = expenseFacet.categoryStats || [];
  const expenseMonthlyTrend = expenseFacet.monthlyTrend || [];

  const blogFacet = blogFacetResult?.[0] || {};
  const totalBlogs = blogFacet.count?.[0]?.count || 0;
  const latestBlog = blogFacet.latest?.[0] || null;
  const popularBlog = blogFacet.popular?.[0] || null;
  const mostViewedBlog = blogFacet.mostViewed?.[0] || null;
  const recentDraft = blogFacet.recentDraft?.[0] || null;

  const tripsTrendCreated = tripsTrendResult.map(t => ({ _id: t._id, count: t.createdCount }));
  const tripsTrendJoined = tripsTrendResult.map(t => ({ _id: t._id, count: t.joinedCount }));

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