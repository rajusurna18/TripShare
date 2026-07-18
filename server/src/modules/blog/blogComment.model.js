import mongoose from "mongoose";

const blogCommentSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogComment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast hierarchy queries and paginations
blogCommentSchema.index({ blog: 1, parentComment: 1, createdAt: -1 });
blogCommentSchema.index({ parentComment: 1, createdAt: 1 });

export default mongoose.model("BlogComment", blogCommentSchema);
