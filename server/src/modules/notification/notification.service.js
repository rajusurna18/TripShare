import Notification from "./notification.model.js";
import { getIo, getOnlineUsers } from "../../utils/socketRegistry.js";

// CREATE
export const createNotificationService =
  async (
    userId,
    message,
    type = "general",
    link = "",
    sender = null
  ) => {

    let category = "SYSTEM";
    const friendTypes = ["friend", "follow"];
    const tripTypes = ["join_request", "trip_leave", "trip_remove", "trip_ownership_transfer", "expense", "trip_save", "trip_share"];
    const memoryTypes = ["memory", "MEMORY_LIKED", "MEMORY_COMMENTED", "MEMORY_REPLIED"];
    const reviewTypes = ["review"];
    const chatTypes = ["chat", "message"];

    const blogTypes = ["BLOG_LIKED", "BLOG_COMMENTED", "BLOG_REPLIED", "BLOG_PUBLISHED"];

    if (friendTypes.includes(type)) {
      category = "FRIEND";
    } else if (tripTypes.includes(type)) {
      category = "TRIP";
    } else if (memoryTypes.includes(type)) {
      category = "MEMORY";
    } else if (reviewTypes.includes(type)) {
      category = "REVIEW";
    } else if (chatTypes.includes(type)) {
      category = "CHAT";
    } else if (blogTypes.includes(type)) {
      category = "BLOG";
    }

    const notification = await Notification.create({
      user: userId,
      message,
      type,
      link,
      sender: sender || null,
      category,
    });

    // Realtime notification delivery over socket.io
    try {
      const io = getIo();
      const onlineUsers = getOnlineUsers();
      if (io && onlineUsers) {
        const userSockets = onlineUsers.get(userId.toString());
        if (userSockets && userSockets.size > 0) {
          const populated = await Notification.findById(notification._id)
            .populate("sender", "name profileImage");
          userSockets.forEach(socketId => {
            io.to(socketId).emit("new_notification", populated);
          });
        }
      }
    } catch (socketErr) {
      console.error("Failed to send real-time notification socket event:", socketErr.message);
    }

    return notification;
};

// GET WITH PAGINATION & CATEGORIES
export const getNotificationsService =
  async (userId, options = {}) => {
    const { page, limit, category } = options;

    const query = { user: userId };
    if (category && category !== "ALL") {
      query.category = category;
    }

    // Fallback: If page/limit options are not passed, return raw list (backward compatibility)
    if (page === undefined && limit === undefined) {
      return await Notification.find(query)
        .populate("sender", "name profileImage")
        .sort({
          createdAt: -1,
        });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const totalResults = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limitNum);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    const notifications = await Notification.find(query)
      .populate("sender", "name profileImage")
      .sort({
        createdAt: -1,
      })
      .skip(skipNum)
      .limit(limitNum);

    return {
      notifications,
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalResults,
      unreadCount,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    };
};

// MARK READ
export const markNotificationReadService =
  async (id, userId) => {

    const notification = await Notification.findById(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.user.toString() !== userId.toString()) {
      throw new Error("Not authorized to modify this notification");
    }

    notification.read = true;
    return await notification.save();
};

// MARK ALL READ
export const markAllReadService = async (userId) => {
  return await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
};

// DELETE SINGLE NOTIFICATION
export const deleteNotificationService = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.user.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this notification");
  }

  return await Notification.deleteOne({ _id: id });
};