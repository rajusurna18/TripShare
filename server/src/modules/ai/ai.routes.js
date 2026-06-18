import express from "express";

import {
  generateAIReply,
  generateItinerary,
} from "./ai.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// AI CHAT
router.post(
  "/chat",
  protect,
  generateAIReply
);

// AI ITINERARY
router.post(
  "/itinerary",
  protect,
  generateItinerary
);

export default router;