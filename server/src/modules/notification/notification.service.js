import Notification
from "./notification.model.js";

// CREATE NOTIFICATION

export const createNotificationService =
  async (userId, message) => {

    return await Notification.create({

      user: userId,

      message,

    });

};

// GET NOTIFICATIONS

export const getNotificationsService =
  async (userId) => {

    return await Notification.find({

      user: userId,

    })

      .sort({
        createdAt: -1,
      });

};

// MARK NOTIFICATION AS READ

export const markNotificationReadService =
  async (id) => {

    return await Notification.findByIdAndUpdate(

      id,

      {
        read: true,
      },

      {
        new: true,
      }

    );

};