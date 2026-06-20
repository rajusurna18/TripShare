import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import Expense from "../expense/expense.model.js";
import Friend from "../friend/friend.model.js";
import Notification from "../notification/notification.model.js";
import Memory from "../memory/memory.model.js";
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
  };
};