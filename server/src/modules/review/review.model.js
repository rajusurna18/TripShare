
import mongoose from "mongoose";

const reviewSchema =
  new mongoose.Schema(

    {

      // REVIEWER

      reviewer: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      // TARGET USER

      reviewFor: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      // RELATED TRIP

      trip: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Trip",

      },

      // RATING

      rating: {

        type: Number,

        required: true,

        min: 1,

        max: 5,

      },

      // COMMENT

      comment: {

        type: String,

        trim: true,

        default: "",

      },

    },

    {

      timestamps: true,

    }

  );

reviewSchema.index({
  reviewFor: 1,
});

export default mongoose.model(
  "Review",
  reviewSchema
);
