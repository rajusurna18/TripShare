import mongoose from "mongoose";

const timelineEventSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    type: {
      type: String,
      enum: ["Note", "Location", "AIStoryMarker"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    noteText: {
      type: String,
      default: "",
    },
    locationData: {
      city: String,
      place: String,
      lat: Number,
      lng: Number,
      visitTime: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

timelineEventSchema.index({ trip: 1, timestamp: 1 });

export default mongoose.model("TimelineEvent", timelineEventSchema);
