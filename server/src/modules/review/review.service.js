import Review from "./review.model.js";

import User from "../auth/auth.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";
import { updateUserStatsCache } from "../profile/profile.service.js";
import { logActivityService } from "../activity/activity.service.js";

// CREATE REVIEW

export const createReviewService =
  async (data) => {

    if (data.reviewer.toString() === data.reviewFor.toString()) {
      throw new Error("You cannot review yourself");
    }

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

    // Update target user's cached stats (which computes trust score using review count & rating)
    await updateUserStatsCache(data.reviewFor);

    const reviewer =
      await User.findById(
        data.reviewer
      );

    try {
      const targetUser = await User.findById(data.reviewFor).select("name");
      await logActivityService(
        data.reviewer,
        "REVIEW_ADDED",
        review._id,
        "Review",
        data.trip || null,
        {
          rating: review.rating,
          comment: review.comment || "",
          reviewedUserId: data.reviewFor,
          reviewedUserName: targetUser?.name || "Traveler",
        },
        "PUBLIC"
      );
    } catch (err) {
      console.error("Failed to log review activity:", err.message);
    }

    await createNotificationService(

      data.reviewFor,

      `${reviewer.name} reviewed your profile ⭐`,

      "review",

      `/reviews/${data.reviewFor}`,

      data.reviewer

    );

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