import mongoose from "mongoose";

const aiPackingListSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categories: [
      {
        name: { type: String, required: true }, // Clothes, Essentials, Electronics, Documents
        items: [
          {
            name: { type: String, required: true },
            checked: { type: Boolean, default: false },
          }
        ]
      }
    ],
    weatherAlerts: {
      type: [String],
      default: [],
    },
    safetyTips: {
      type: [String],
      default: [],
    },
    healthTips: {
      type: [String],
      default: [],
    },
    thingsToAvoid: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index to prevent duplicate lists for the same user & trip
aiPackingListSchema.index({ trip: 1, user: 1 }, { unique: true });

export default mongoose.model("AIPackingList", aiPackingListSchema);
