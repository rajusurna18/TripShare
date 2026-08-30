import {
  processTravelCommerceIntent,
  createTravelOrderService,
  verifyTravelPaymentService,
  cancelTravelPaymentService,
  getTravelAuditTrailService,
} from "./travelCommerce.service.js";

// Process natural language intent & policy validation
export const handleTravelIntent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "User travel prompt is required",
      });
    }

    const result = await processTravelCommerceIntent(req.user.id, prompt);
    res.status(200).json(result);
  } catch (err) {
    console.error("TRAVEL INTENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to process travel intent",
    });
  }
};

// Create Razorpay payment order after user confirmation
export const createTravelOrder = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "transactionId is required",
      });
    }

    const result = await createTravelOrderService(req.user.id, transactionId);
    res.status(200).json(result);
  } catch (err) {
    console.error("CREATE TRAVEL ORDER ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create travel payment order",
    });
  }
};

// Verify Razorpay payment HMAC signature
export const verifyTravelPayment = async (req, res) => {
  try {
    const result = await verifyTravelPaymentService(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("VERIFY TRAVEL PAYMENT ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Travel payment verification failed",
    });
  }
};

// Handle payment cancellation
export const cancelTravelPayment = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "transactionId is required",
      });
    }

    const result = await cancelTravelPaymentService(req.user.id, transactionId, reason);
    res.status(200).json(result);
  } catch (err) {
    console.error("CANCEL TRAVEL PAYMENT ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to cancel travel payment",
    });
  }
};

// Get audit trail for a transaction
export const getTravelAuditTrail = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await getTravelAuditTrailService(req.user.id, transactionId);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET AUDIT TRAIL ERROR:", err);
    res.status(404).json({
      success: false,
      message: err.message || "Audit trail not found",
    });
  }
};
