import express from "express";

import {
  generateAIReply,
  generateItinerary,
  generateGenericTool,
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  getSubscriptionStatus,
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} from "./ai.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { aiChatLimiter } from "../../middleware/rateLimiters.js";
import { checkAIEntitlement } from "./aiEntitlement.middleware.js";

const router = express.Router();

// AI CHAT
router.post(
  "/chat",
  protect,
  aiChatLimiter,
  checkAIEntitlement("ai_assistant"),
  generateAIReply
);

// AI ITINERARY
router.post(
  "/itinerary",
  protect,
  checkAIEntitlement("itinerary"),
  generateItinerary
);

// GENERIC AI TOOLS (planner, destination, safety, budget, trip_assistant)
router.post("/planner", protect, checkAIEntitlement("planner"), generateGenericTool("planner"));
router.post("/destination", protect, checkAIEntitlement("destination"), generateGenericTool("destination"));
router.post("/safety", protect, checkAIEntitlement("safety"), generateGenericTool("safety"));
router.post("/budget", protect, checkAIEntitlement("budget"), generateGenericTool("budget"));
router.post("/trip-assistant", protect, checkAIEntitlement("trip_assistant"), generateGenericTool("trip_assistant"));

// SUBSCRIPTION & PAYMENT
router.get("/subscription/status", protect, getSubscriptionStatus);
router.post("/subscription/create-order", protect, createPaymentOrder);
router.post("/subscription/verify-payment", protect, verifyPayment);
router.post("/subscription/webhook", express.raw({ type: "application/json" }), handleWebhook);

// AI CONVERSATION CRUD
router.get("/conversations", protect, getConversations);
router.get("/conversations/:id", protect, getConversation);
router.post("/conversations", protect, createConversation);
router.delete("/conversations/:id", protect, deleteConversation);

export default router;