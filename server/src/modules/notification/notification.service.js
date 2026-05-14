import Notification
from "./notification.model.js";

export const createNotificationService =
  async (userId, message) => {

    return await Notification.create({
      user: userId,
      message,
    });
};

export const getNotificationsService =
  async (userId) => {

    return await Notification.find({
      user: userId,
    }).sort({ createdAt: -1 });
};