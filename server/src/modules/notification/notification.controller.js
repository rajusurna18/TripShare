import {
  getNotificationsService,
  markNotificationReadService,
  markAllReadService,
  deleteNotificationService,
} from "./notification.service.js";

// GET NOTIFICATIONS (PAGINATED & FILTERED)
export const getNotifications =
  async (req, res) => {
    try {
      const { page, limit, category } = req.query;

      const options = {};
      if (page !== undefined) options.page = page;
      if (limit !== undefined) options.limit = limit;
      if (category !== undefined) options.category = category;

      const result = await getNotificationsService(req.user.id, options);
      res.json(result);
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
};

// MARK AS READ (SINGLE)
export const markNotificationRead =
  async (req, res) => {
    try {
      const notification =
        await markNotificationReadService(
          req.params.id,
          req.user.id
        );
      res.json(notification);
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
};

// MARK ALL AS READ (BULK)
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await markAllReadService(req.user.id);
    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// DELETE SINGLE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    await deleteNotificationService(req.params.id, req.user.id);
    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};