import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "TRIP_CREATED",
        "TRIP_JOINED",
        "MEMORY_UPLOADED",
        "BLOG_POSTED",
        "REVIEW_ADDED",
        "FRIEND_ADDED",
        "FOLLOWED_USER",
        "TIMELINE_CREATED"
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Trip", "Memory", "Review", "Blog", "User"],
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "FRIENDS_ONLY", "MEMBERS_ONLY"],
      default: "PUBLIC",
    },
  },
  {
    timestamps: true,
  }
);

// COMPOUND INDEXES FOR MAXIMUM QUERY PERFORMANCE
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ visibility: 1, createdAt: -1 });
activitySchema.index({ tripId: 1, visibility: 1 });

export default mongoose.model("Activity", activitySchema);
