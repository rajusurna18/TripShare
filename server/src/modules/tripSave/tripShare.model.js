import mongoose from "mongoose";

const tripShareSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    platform: {
      type: String,
      enum: ["whatsapp", "instagram", "copy_link"],
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

tripShareSchema.index({ trip: 1 });
tripShareSchema.index({ user: 1 });

export default mongoose.model("TripShare", tripShareSchema);
