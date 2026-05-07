import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
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

    date: {
      type: Date,
      required: true,
    },

    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);