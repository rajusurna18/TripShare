import API from "./api";

/**
 * Get current user's subscription and usage statistics for all 10 tools.
 */
export const getSubscriptionStatus = async () => {
  const res = await API.get("/ai/subscription/status");
  return res.data;
};

/**
 * Create a Razorpay checkout order for a plan.
 */
export const createPaymentOrder = async (plan, purchasedToolId = null) => {
  const res = await API.post("/ai/subscription/create-order", {
    plan,
    purchasedToolId,
  });
  return res.data;
};

/**
 * Verify Razorpay payment signature after successful checkout.
 */
export const verifyPayment = async (paymentPayload) => {
  const res = await API.post("/ai/subscription/verify-payment", paymentPayload);
  return res.data;
};
