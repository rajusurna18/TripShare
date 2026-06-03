
import {

  createReviewService,

  getUserReviewsService,

} from "./review.service.js";

// CREATE REVIEW

export const createReview =
  async (req, res) => {

    try {

      const review =
        await createReviewService({

          ...req.body,

          reviewer:
            req.user.id,

        });

      res.status(201).json({

        success: true,

        message:
          "Review added successfully",

        review,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message: err.message,

      });

    }

};

// GET USER REVIEWS

export const getUserReviews =
  async (req, res) => {

    try {

      const data =
        await getUserReviewsService(

          req.params.userId

        );

      res.status(200).json({

        success: true,

        ...data,

      });

    } catch (err) {

      res.status(400).json({

        success: false,

        message: err.message,

      });

    }

};
