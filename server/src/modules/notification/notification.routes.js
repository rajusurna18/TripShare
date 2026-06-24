import express from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./notification.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getNotifications
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsRead
);

router.put(
  "/:id/read",
  protect,
  markNotificationRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

export default router;