import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(

    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      sender: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        default: "general",
      },

      link: {
        type: String,
        default: "",
      },

      read: {
        type: Boolean,
        default: false,
      },

      category: {
        type: String,
        enum: ["FRIEND", "TRIP", "CHAT", "MEMORY", "REVIEW", "SYSTEM"],
        default: "SYSTEM",
      },
    },

    {
      timestamps: true,
    }

  );

// INDEXES FOR QUERY OPTIMIZATION
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1, category: 1 });

export default mongoose.model(
  "Notification",
  notificationSchema
);