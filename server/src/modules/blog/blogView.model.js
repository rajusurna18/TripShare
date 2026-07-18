import mongoose from "mongoose";

const blogViewSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    identifier: {
      type: String, // Stringified userId or IP hash to deduplicate views
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatic deletion after 24 hours (24 * 3600 seconds)
    },
  }
);

// Compound index on blog and identifier to speed up checking unique views
blogViewSchema.index({ blog: 1, identifier: 1 }, { unique: true });

export default mongoose.model("BlogView", blogViewSchema);
