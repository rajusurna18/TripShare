import mongoose from "mongoose";

const blogLikeSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Unique compound index to prevent duplicate likes and optimize lookup queries
blogLikeSchema.index({ blog: 1, user: 1 }, { unique: true });

export default mongoose.model("BlogLike", blogLikeSchema);
