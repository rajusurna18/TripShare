import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    coverImage: {
      type: String,
      default: "",
    },
    content: {
      type: String, // Rich-Text stored as stringified JSON (from Editor.js)
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readTime: {
      type: Number, // In minutes (auto-calculated)
      default: 1,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "followers_only", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes for performance
blogSchema.index({ author: 1, visibility: 1, createdAt: -1 });
blogSchema.index({ visibility: 1, createdAt: -1 });
blogSchema.index({ tags: 1, visibility: 1, createdAt: -1 });
blogSchema.index({ destination: 1, visibility: 1, createdAt: -1 });

// Full text index on search fields
blogSchema.index(
  {
    title: "text",
    destination: "text",
    tags: "text",
    content: "text",
  },
  {
    weights: {
      title: 10,
      destination: 5,
      tags: 3,
      content: 1,
    },
    name: "BlogTextIndex",
  }
);

export default mongoose.model("Blog", blogSchema);
