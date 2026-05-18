import mongoose from "mongoose";

const tripSchema =
  new mongoose.Schema(

    {

      title: {
        type: String,
        required: true,
      },

      destination: {
        type: String,
        required: true,
      },

      budget: {
        type: Number,
        required: true,
      },

      image: {
        type: String,
        default: "",
      },

      date: {
        type: Date,
        required: true,
      },

      description: {
        type: String,
        default: "",
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      members: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

    },

    {
      timestamps: true,
    }

  );

export default mongoose.model(
  "Trip",
  tripSchema
);