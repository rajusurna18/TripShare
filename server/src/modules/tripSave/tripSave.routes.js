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
import { tripsLimiter } from "../../middleware/rateLimiters.js";

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
router.post("/:tripId", protect, tripsLimiter, saveTrip);
router.delete("/:tripId", protect, tripsLimiter, unsaveTrip);
router.get("/", protect, getSavedTrips);

// Share trip accepts guests but tracks and rate limits them strictly (5 shares / minute)
router.post(
  "/:tripId/share",
  optionalProtect,
  tripsLimiter,
  shareTrip
);

// Analytics dashboard endpoint
router.get("/analytics/shares", protect, getShareAnalytics);

export default router;
