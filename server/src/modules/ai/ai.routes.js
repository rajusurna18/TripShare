import express from "express";

import {
  generateAIReply,
  generateItinerary,
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
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

// AI CONVERSATION CRUD
router.get("/conversations", protect, getConversations);
router.get("/conversations/:id", protect, getConversation);
router.post("/conversations", protect, createConversation);
router.delete("/conversations/:id", protect, deleteConversation);

export default router;