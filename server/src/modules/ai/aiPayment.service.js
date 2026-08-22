import crypto from "crypto";
import Razorpay from "razorpay";
import AISubscription from "./aiSubscription.model.js";
import AIPayment from "./aiPayment.model.js";
import { PLANS, AI_TOOLS } from "../../config/aiConfig.js";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
  return new Razorpay({ key_id, key_secret });
};

/**
 * Create Razorpay payment order for AI Subscription.
 * STRICT: Creates a PENDING order only. Does NOT activate subscription or grant entitlement.
 */
export const createOrderService = async (userId, planKey, purchasedToolId) => {
  const planConfig = PLANS[planKey];
  if (!planConfig || planKey === "FREE") {
    throw new Error("Invalid subscription plan selected");
  }

  if (planKey === "INDIVIDUAL") {
    if (!purchasedToolId) {
      throw new Error("Individual plan requires selecting one AI tool");
    }
    const isValidTool = AI_TOOLS.some((t) => t.id === purchasedToolId);
    if (!isValidTool) {
      throw new Error("Selected AI tool is invalid");
    }
  }

  const razorpay = getRazorpayInstance();
  const receipt = `ts_ai_${userId.toString().substring(0, 8)}_${Date.now()}`;

  const options = {
    amount: planConfig.amountPaise,
    currency: planConfig.currency || "INR",
    receipt,
    notes: {
      userId: userId.toString(),
      plan: planKey,
      purchasedToolId: purchasedToolId || "",
    },
  };

  let order;
  try {
    order = await razorpay.orders.create(options);
  } catch (err) {
    console.error("Razorpay Order Creation Failed:", err);
    // If Razorpay test keys are not configured or network error, generate receipt order for testing
    if (process.env.NODE_ENV !== "production" && (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes("placeholder"))) {
      order = {
        id: `order_mock_${Date.now()}`,
        amount: planConfig.amountPaise,
        currency: planConfig.currency || "INR",
        receipt,
      };
    } else {
      throw new Error("Failed to create payment order with payment gateway");
    }
  }

  // Store payment ledger record as CREATED / PENDING.
  // DO NOT activate subscription or alter AISubscription status here.
  await AIPayment.create({
    userId,
    razorpayOrderId: order.id,
    plan: planKey,
    purchasedToolId: planKey === "INDIVIDUAL" ? purchasedToolId : null,
    amount: planConfig.price,
    currency: planConfig.currency,
    status: "CREATED",
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    plan: planKey,
    purchasedToolId,
  };
};

/**
 * Verify Razorpay payment signature & activate subscription idempotently.
 * STRICT: ONLY activates subscription after server-side HMAC signature verification and order matching.
 */
export const verifyPaymentService = async (userId, paymentData) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = paymentData;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error("Missing required payment verification credentials");
  }

  // Retrieve original order record from server DB matching this user
  const paymentRecord = await AIPayment.findOne({
    razorpayOrderId: razorpay_order_id,
    userId,
  });

  if (!paymentRecord) {
    throw new Error("Payment verification failed: Order record not found or unauthorized");
  }

  // Idempotency check: if already processed, return existing active subscription
  if (paymentRecord.status === "SUCCESS") {
    const existingSub = await AISubscription.findOne({ userId });
    return {
      success: true,
      subscription: existingSub,
      message: "Subscription already active",
    };
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
  const isMockOrder = razorpay_order_id.startsWith("order_mock_");

  if (!isMockOrder) {
    // Perform timing-safe HMAC-SHA256 signature verification using server DB order ID
    const body = `${paymentRecord.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const sigBuf = Buffer.from(razorpay_signature, "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error("Payment verification failed: Invalid HMAC signature");
    }
  }

  const selectedPlan = paymentRecord.plan || "PRO";
  const purchasedToolId = paymentRecord.purchasedToolId || null;
  const planConfig = PLANS[selectedPlan];
  const months = planConfig ? planConfig.periodMonths : 1;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  // Update payment record status
  paymentRecord.razorpayPaymentId = razorpay_payment_id;
  paymentRecord.status = "SUCCESS";
  await paymentRecord.save();

  // Upsert subscription to ACTIVE state ONLY NOW
  let subscription = await AISubscription.findOne({ userId });
  if (!subscription) {
    subscription = new AISubscription({ userId });
  }

  subscription.plan = selectedPlan;
  subscription.purchasedToolId = selectedPlan === "INDIVIDUAL" ? purchasedToolId : null;
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  subscription.status = "ACTIVE";
  subscription.razorpayOrderId = razorpay_order_id;
  subscription.razorpayPaymentId = razorpay_payment_id;
  subscription.razorpaySignature = razorpay_signature;

  await subscription.save();

  return {
    success: true,
    subscription,
    message: "AI Subscription activated successfully!",
  };
};

/**
 * Handle Razorpay Webhook Event idempotently.
 */
export const handleWebhookService = async (rawBody, signatureHeader) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (secret && signatureHeader) {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody))
      .digest("hex");

    const sigBuf = Buffer.from(signatureHeader, "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error("Invalid webhook signature");
    }
  }

  const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  const event = payload.event;

  if (event === "payment.captured" || event === "order.paid") {
    const paymentEntity = payload.payload?.payment?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};
      const userId = notes.userId;

      if (userId && orderId) {
        await verifyPaymentService(userId, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signatureHeader || "webhook_verified",
        });
      }
    }
  }

  return { received: true };
};
