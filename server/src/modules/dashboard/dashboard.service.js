import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import Expense from "../expense/expense.model.js";
import Friend from "../friend/friend.model.js";
import Notification from "../notification/notification.model.js";
import Memory from "../memory/memory.model.js";

export const getDashboardStatsService =
  async (userId) => {

    const user =
      await User.findById(userId);

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // TRIPS CREATED

    const tripsCreated =
      await Trip.countDocuments({

        createdBy: userId,

      });

    // TRIPS JOINED

    const tripsJoined =
      await Trip.countDocuments({

        members: userId,

      });

    // FRIENDS

    const totalFriends =
      await Friend.countDocuments({

        $or: [

          {
            sender: userId,
          },

          {
            receiver: userId,
          },

        ],

        status: "accepted",

      });

    // PENDING REQUESTS

    const pendingRequests =
      await Friend.countDocuments({

        receiver: userId,

        status: "pending",

      });

    // REVIEWS

    const reviews =
      await Review.find({

        reviewFor: userId,

      });

    const totalReviews =
      reviews.length;

    // TRUST SCORE

    let trustScore = 0;

    if (reviews.length > 0) {

      const totalRating =
        reviews.reduce(

          (sum, review) =>

            sum + review.rating,

          0

        );

      trustScore =
        Math.min(

          100,

          Math.round(
            (totalRating /
              reviews.length) *
              20
          )

        );

    }

    // EXPENSES

    const expenseResult =
      await Expense.aggregate([

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

      ]);

    const totalExpenses =
      expenseResult[0]?.total || 0;

    // MEMORIES

    const totalMemories =
      await Memory.countDocuments({

        user: userId,

      });

    // NOTIFICATIONS

    const unreadNotifications =
      await Notification.countDocuments({

        user: userId,

        read: false,

      });

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