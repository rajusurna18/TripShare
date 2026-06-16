import Notification
from "./notification.model.js";

// CREATE

export const createNotificationService =
  async (
    userId,
    message,
    type = "general",
    link = ""
  ) => {

    return await Notification.create({

      user: userId,

      message,

      type,

      link,

    });

};

// GET

export const getNotificationsService =
  async (userId) => {

    return await Notification.find({

      user: userId,

    }).sort({

      createdAt: -1,

    });

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