import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import Review from "../review/review.model.js";
import Expense from "../expense/expense.model.js";
import Friend from "../friend/friend.model.js";

export const getDashboardStatsService =
  async (userId) => {

    // USER

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

    // REVIEWS RECEIVED

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

      const avgRating =
        totalRating /
        reviews.length;

      trustScore =
        Math.min(

          100,

          Math.round(
            avgRating * 20
          )

        );

    }

    // TOTAL EXPENSES PAID (OPTIMIZED)

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

    return {

      tripsCreated,

      tripsJoined,

      totalFriends,

      totalReviews,

      trustScore,

      totalExpenses,

    };

};