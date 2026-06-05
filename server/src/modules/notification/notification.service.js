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