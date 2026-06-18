import mongoose from "mongoose";

const joinRequestSchema =
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

      status: {

        type: String,

        enum: [

          "pending",

          "accepted",

          "rejected",

        ],

        default: "pending",

      },

    },

    {

      timestamps: true,

    }

  );

joinRequestSchema.index({
  trip: 1,
  user: 1,
});

export default mongoose.model(

  "JoinRequest",

  joinRequestSchema

);