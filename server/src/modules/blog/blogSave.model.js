import mongoose from "mongoose";

const blogSaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only save a blog once
blogSaveSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model("BlogSave", blogSaveSchema);
