import {
  getNotificationsService,
} from "./notification.service.js";

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