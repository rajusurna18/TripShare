import mongoose from "mongoose";

const memoryCommentSchema = new mongoose.Schema(
  {
    memory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
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
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemoryComment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// COMPOUND INDEXES FOR MAXIMUM QUERY PERFORMANCE
memoryCommentSchema.index({ memory: 1, parentComment: 1, createdAt: -1 });
memoryCommentSchema.index({ parentComment: 1, createdAt: 1 });

export default mongoose.model("MemoryComment", memoryCommentSchema);
