import Message from "./message.model.js";

// SAVE MESSAGE
export const saveMessageService = async (data) => {
  const message = await Message.create(data);

  return await Message.findById(message._id)
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .populate("trip", "title destination members");
};

export const getMessagesService = async (tripId, options = {}) => {
  const { page, limit } = options;
  const query = { trip: tripId };

  if (page === undefined && limit === undefined) {
    return await Message.find(query)
      .populate("sender", "name profileImage")
      .populate("reactions.user", "name profileImage")
      .lean()
      .sort({
        createdAt: 1,
      });
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skipNum = (pageNum - 1) * limitNum;

  const totalMessages = await Message.countDocuments(query);
  const totalPages = Math.ceil(totalMessages / limitNum);

  const messages = await Message.find(query)
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .sort({
      createdAt: -1,
    })
    .skip(skipNum)
    .limit(limitNum)
    .lean();

  messages.reverse();

  return {
    messages,
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalMessages,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1,
  };
};

// GET RECENT MESSAGES
export const getRecentMessagesService = async (tripId) => {
  return await Message.find({
    trip: tripId,
  })
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .sort({
      createdAt: -1,
    })
    .limit(10);
};

// REACT TO MESSAGE (NEW)
export const reactToMessageService = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  // Find if user already reacted
  const existingReactionIdx = message.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingReactionIdx > -1) {
    if (message.reactions[existingReactionIdx].emoji === emoji) {
      // Toggle off if same emoji
      message.reactions.splice(existingReactionIdx, 1);
    } else {
      // Update if different emoji
      message.reactions[existingReactionIdx].emoji = emoji;
    }
  } else {
    // Push new reaction
    message.reactions.push({ user: userId, emoji });
  }

  await message.save();

  return await Message.findById(messageId)
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage");
};

// EDIT MESSAGE
export const editMessageService = async (messageId, userId, newText) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Unauthorized: You can only edit your own messages");
  }
  message.message = newText;
  message.isEdited = true;
  await message.save();
  return await Message.findById(messageId)
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage");
};

// DELETE MESSAGE
export const deleteMessageService = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("Unauthorized: You can only delete your own messages");
  }
  await Message.deleteOne({ _id: messageId });
  return { success: true, message: "Message deleted successfully", data: message };
};