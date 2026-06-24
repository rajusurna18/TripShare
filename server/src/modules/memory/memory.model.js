import mongoose from "mongoose";

const memorySchema =
  new mongoose.Schema(

    {

      trip: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Trip",

        required: true,

      },

      user: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      image: {

        type: String,

        required: true,

      },

      caption: {

        type: String,

        default: "",

      },

      likes: [

        {

          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",

        },

      ],

      comments: [

        {

          user: {

            type:
              mongoose.Schema.Types.ObjectId,

            ref: "User",

          },

          text: String,

          createdAt: {

            type: Date,

            default: Date.now,

          },

        },

      ],

      likesCount: {
        type: Number,
        default: 0,
      },

      commentsCount: {
        type: Number,
        default: 0,
      },

    },

    {

      timestamps: true,

    }

  );

export default mongoose.model(
  "Memory",
  memorySchema
);