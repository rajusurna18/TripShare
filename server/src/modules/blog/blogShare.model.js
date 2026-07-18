import mongoose from "mongoose";

const blogShareSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // Nullable for guest shares
      ref: "User",
      default: null,
    },
    platform: {
      type: String,
      enum: ["whatsapp", "telegram", "copy_link", "other"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index to aggregate share metrics
blogShareSchema.index({ blog: 1, platform: 1 });

export default mongoose.model("BlogShare", blogShareSchema);
