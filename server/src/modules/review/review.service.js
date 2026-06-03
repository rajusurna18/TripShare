
import Review
from "./review.model.js";

import User
from "../auth/auth.model.js";

// CREATE REVIEW

export const createReviewService =
  async (data) => {

    // CHECK EXISTING REVIEW

    const alreadyReviewed =
      await Review.findOne({

        reviewer:
          data.reviewer,

        reviewFor:
          data.reviewFor,

        trip:
          data.trip,

      });

    if (alreadyReviewed) {

      throw new Error(
        "You already reviewed this traveler"
      );

    }

    const review =
      await Review.create(data);

    return review;

};

// GET USER REVIEWS

export const getUserReviewsService =
  async (userId) => {

    const reviews =
      await Review.find({

        reviewFor: userId,

      })

        .populate(
          "reviewer",
          "name profileImage"
        )

        .populate(
          "trip",
          "title destination"
        )

        .sort({
          createdAt: -1,
        });

    // AVERAGE RATING

    const total =
      reviews.reduce(

        (sum, review) =>

          sum + review.rating,

        0

      );

    const averageRating =

      reviews.length > 0

        ? (
            total /
            reviews.length
          ).toFixed(1)

        : 0;

    // TRUST SCORE

    const trustScore =
      Math.min(

        100,

        Math.round(
          averageRating * 20
        )

      );

    return {

      reviews,

      totalReviews:
        reviews.length,

      averageRating,

      trustScore,

    };

};
