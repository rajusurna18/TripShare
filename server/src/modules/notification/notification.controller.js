import {

  getNotificationsService,

  markNotificationReadService,

} from "./notification.service.js";

// GET NOTIFICATIONS

export const getNotifications =
  async (req, res) => {

    try {

      const notifications =

        await getNotificationsService(
          req.user.id
        );

      res.json(notifications);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};

// MARK AS READ

export const markNotificationRead =
  async (req, res) => {

    try {

      const notification =

        await markNotificationReadService(
          req.params.id
        );

      res.json(notification);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};