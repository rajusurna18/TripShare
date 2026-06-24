import Memory from "./memory.model.js";
import User from "../auth/auth.model.js";
import {
  createNotificationService,
} from "../notification/notification.service.js";
import Trip from "../trip/trip.model.js";
import { logActivityService } from "../activity/activity.service.js";
import MemoryComment from "./memoryComment.model.js";

export const createMemoryService =
  async (data) => {

    const memory = await Memory.create(data);

    try {
      const trip = await Trip.findById(data.trip).select("visibility title");
      const visibility = trip?.visibility === "private" ? "MEMBERS_ONLY" : "PUBLIC";

      await logActivityService(
        data.user,
        "MEMORY_UPLOADED",
        memory._id,
        "Memory",
        data.trip,
        {
          caption: memory.caption || "",
          imageUrl: memory.image,
          tripTitle: trip?.title || "",
        },
        visibility
      );
    } catch (err) {
      console.error("Failed to log memory activity:", err.message);
    }

    return memory;

};

export const getTripMemoriesService =
  async (tripId) => {

    return await Memory.find({
      trip: tripId,
    })

      .populate(
        "user",
        "name profileImage"
      )

      .sort({
        createdAt: -1,
      });

};

export const likeMemoryService =
  async (
    memoryId,
    userId
  ) => {

    const memory =
      await Memory.findById(memoryId);

    if (!memory) {
      throw new Error(
        "Memory not found"
      );
    }

    const alreadyLiked =
      memory.likes.some(
        id =>
          id.toString() ===
          userId.toString()
      );

    if (alreadyLiked) {

      memory.likes =
        memory.likes.filter(
          id =>
            id.toString() !==
            userId.toString()
        );

    } else {

      memory.likes.push(userId);

      if (
        memory.user.toString() !==
        userId.toString()
      ) {

        const user =
          await User.findById(userId);

        await createNotificationService(

          memory.user,

          `${user.name} liked your memory ❤️`,

          "MEMORY_LIKED",

          `/memories/${memory.trip}`,

          userId

        );

      }

    }

    memory.likesCount = memory.likes.length;
    await memory.save();

    return await Memory.findById(
      memoryId
    ).populate(
      "user",
      "name profileImage"
    );

};

// CREATE COMMENT
export const createCommentService = async (memoryId, userId, text) => {
  const memory = await Memory.findById(memoryId);
  if (!memory) {
    throw new Error("Memory not found");
  }

  const comment = await MemoryComment.create({
    memory: memoryId,
    user: userId,
    text,
    parentComment: null,
  });

  await comment.populate("user", "name profileImage");

  // Atomically increment comment count
  await Memory.findByIdAndUpdate(memoryId, { $inc: { commentsCount: 1 } });

  // Send MEMORY_COMMENTED notification
  if (memory.user.toString() !== userId.toString()) {
    try {
      const commenter = await User.findById(userId);
      await createNotificationService(
        memory.user,
        `${commenter.name} commented on your memory: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`,
        "MEMORY_COMMENTED",
        `/memories/${memory.trip}`,
        userId
      );
    } catch (err) {
      console.error("Failed to send comment notification:", err.message);
    }
  }

  return comment;
};

// CREATE REPLY
export const createReplyService = async (memoryId, userId, commentId, text) => {
  const memory = await Memory.findById(memoryId);
  if (!memory) {
    throw new Error("Memory not found");
  }

  const parentComment = await MemoryComment.findById(commentId);
  if (!parentComment) {
    throw new Error("Parent comment not found");
  }

  // Reply depth limit = 1 (cannot reply to a reply)
  if (parentComment.parentComment) {
    throw new Error("Reply depth limit is 1. Cannot reply to a nested reply.");
  }

  const reply = await MemoryComment.create({
    memory: memoryId,
    user: userId,
    text,
    parentComment: commentId,
  });

  await reply.populate("user", "name profileImage");

  // Atomically increment comment count
  await Memory.findByIdAndUpdate(memoryId, { $inc: { commentsCount: 1 } });

  // Send MEMORY_REPLIED notification to parent comment's owner
  if (parentComment.user.toString() !== userId.toString()) {
    try {
      const replier = await User.findById(userId);
      await createNotificationService(
        parentComment.user,
        `${replier.name} replied to your comment: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`,
        "MEMORY_REPLIED",
        `/memories/${memory.trip}`,
        userId
      );
    } catch (err) {
      console.error("Failed to send reply notification:", err.message);
    }
  }

  return reply;
};

// GET MEMORY COMMENTS
export const getMemoryCommentsService = async (memoryId, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  const totalResults = await MemoryComment.countDocuments({
    memory: memoryId,
    parentComment: null,
  });

  const comments = await MemoryComment.find({
    memory: memoryId,
    parentComment: null,
  })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(limitNum);

  // Fetch replies for these comments to map nesting
  const commentIds = comments.map(c => c._id);
  const replies = await MemoryComment.find({
    memory: memoryId,
    parentComment: { $in: commentIds },
  })
    .populate("user", "name profileImage")
    .sort({ createdAt: 1 });

  // Map replies to parent comments
  const repliesMap = {};
  replies.forEach(reply => {
    const pId = reply.parentComment.toString();
    if (!repliesMap[pId]) {
      repliesMap[pId] = [];
    }
    repliesMap[pId].push(reply);
  });

  const commentsWithReplies = comments.map(c => {
    const commentObj = c.toObject();
    commentObj.replies = repliesMap[c._id.toString()] || [];
    return commentObj;
  });

  return {
    comments: commentsWithReplies,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalResults / limitNum),
    totalResults,
  };
};

// DELETE COMMENT (WITH CASCADE CLEANUP)
export const deleteCommentService = async (commentId, userId) => {
  const comment = await MemoryComment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const memory = await Memory.findById(comment.memory);
  const isAuthor = comment.user.toString() === userId.toString();
  const isMemoryOwner = memory && memory.user.toString() === userId.toString();

  if (!isAuthor && !isMemoryOwner) {
    throw new Error("Not authorized to delete this comment");
  }

  let deletedCount = 0;

  if (!comment.parentComment) {
    // Cascade cleanup: delete parent comment and all its replies
    const deleteResult = await MemoryComment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });
    deletedCount = deleteResult.deletedCount || 1;
  } else {
    // Delete single reply comment
    await MemoryComment.deleteOne({ _id: commentId });
    deletedCount = 1;
  }

  // Update cached commentsCount in Memory document
  if (memory) {
    const updatedMemory = await Memory.findByIdAndUpdate(
      comment.memory,
      { $inc: { commentsCount: -deletedCount } },
      { new: true }
    );
    if (updatedMemory && updatedMemory.commentsCount < 0) {
      updatedMemory.commentsCount = 0;
      await updatedMemory.save();
    }
  }

  return { deletedCount };
};