import express from "express";
import {
  handleTravelIntent,
  createTravelOrder,
  verifyTravelPayment,
  cancelTravelPayment,
  getTravelAuditTrail,
} from "./travelCommerce.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Process travel commerce natural language intent & policy validation
router.post("/intent", protect, handleTravelIntent);

// Create Razorpay payment order (Gated by explicit user confirmation)
router.post("/order", protect, createTravelOrder);

// Verify Razorpay payment HMAC signature idempotently
router.post("/verify-payment", protect, verifyTravelPayment);

// Handle payment cancellation gracefully
router.post("/cancel-payment", protect, cancelTravelPayment);

// Retrieve audit trail for a transaction
router.get("/audit/:transactionId", protect, getTravelAuditTrail);

export default router;
