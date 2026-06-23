import Message from "./message.model.js";

// SAVE MESSAGE
export const saveMessageService = async (data) => {
  const message = await Message.create(data);

  return await Message.findById(message._id)
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .populate("trip", "title destination members");
};

// GET TRIP MESSAGES
export const getMessagesService = async (tripId) => {
  return await Message.find({
    trip: tripId,
  })
    .populate("sender", "name profileImage")
    .populate("reactions.user", "name profileImage")
    .lean()
    .sort({
      createdAt: 1,
    });
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