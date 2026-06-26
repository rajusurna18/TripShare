import express from "express";
import jwt from "jsonwebtoken";
import {
  saveTrip,
  unsaveTrip,
  getSavedTrips,
  shareTrip,
  getShareAnalytics,
} from "./tripSave.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { customRateLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Extract user token if present (but do not block guest access)
const optionalProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Fail silently for guests
    }
  }
  next();
};

// Route mapping
router.post("/:tripId", protect, customRateLimiter(10, 60000), saveTrip);
router.delete("/:tripId", protect, customRateLimiter(10, 60000), unsaveTrip);
router.get("/", protect, getSavedTrips);

// Share trip accepts guests but tracks and rate limits them strictly (5 shares / minute)
router.post(
  "/:tripId/share",
  optionalProtect,
  customRateLimiter(5, 60000),
  shareTrip
);

// Analytics dashboard endpoint
router.get("/analytics/shares", protect, getShareAnalytics);

export default router;
