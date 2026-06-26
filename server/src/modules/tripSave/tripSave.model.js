import mongoose from "mongoose";

const tripSaveSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one save per user per trip
tripSaveSchema.index({ user: 1, trip: 1 }, { unique: true });

export default mongoose.model("TripSave", tripSaveSchema);
