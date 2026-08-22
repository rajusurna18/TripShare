import AISubscription from "./aiSubscription.model.js";
import AIUsage from "./aiUsage.model.js";
import { AI_TOOLS, PLANS } from "../../config/aiConfig.js";

/**
 * Get active subscription for a user, handling auto-expiry check.
 */
export const getUserActiveSubscription = async (userId) => {
  let sub = await AISubscription.findOne({ userId });
  if (!sub) {
    return {
      plan: "FREE",
      purchasedToolId: null,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: null,
    };
  }

  // Check if expired
  if (sub.status === "ACTIVE" && sub.endDate && new Date() > new Date(sub.endDate)) {
    sub.status = "EXPIRED";
    await sub.save();
  }

  if (sub.status !== "ACTIVE") {
    return {
      plan: "FREE",
      purchasedToolId: null,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
    };
  }

  return sub;
};

/**
 * Calculate usage period dates (30-day billing cycle or current subscription period cycle).
 */
export const getCurrentUsagePeriod = (subscription) => {
  const now = new Date();
  let periodStart;
  let periodEnd;

  if (subscription && subscription.plan !== "FREE" && subscription.startDate) {
    const start = new Date(subscription.startDate);
    const monthsDiff = Math.floor((now - start) / (30 * 24 * 60 * 60 * 1000));
    periodStart = new Date(start.getTime() + monthsDiff * 30 * 24 * 60 * 60 * 1000);
    periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    // Calendar month default for FREE users
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { periodStart, periodEnd };
};

/**
 * Get entitled limit for a specific tool under active subscription.
 */
export const getToolLimit = (subscription, toolId) => {
  const toolConfig = AI_TOOLS.find((t) => t.id === toolId);
  const defaultFreeLimit = toolConfig ? toolConfig.freeLimit : 5;

  if (!subscription || subscription.plan === "FREE") {
    return defaultFreeLimit;
  }

  switch (subscription.plan) {
    case "PRO":
      return PLANS.PRO.limitPerTool; // 500
    case "COMBO":
      return PLANS.COMBO.limitPerTool; // 300
    case "INDIVIDUAL":
      if (subscription.purchasedToolId === toolId) {
        return PLANS.INDIVIDUAL.limitPerTool; // 200
      }
      return defaultFreeLimit; // Retain standard FREE limit
    default:
      return defaultFreeLimit;
  }
};

/**
 * Fetch usage record for user + toolId in current period.
 */
export const getToolUsageRecord = async (userId, toolId, periodStart, periodEnd) => {
  let usage = await AIUsage.findOne({
    userId,
    toolId,
    periodStart: { $gte: new Date(periodStart.getTime() - 1000) },
  });

  if (!usage) {
    usage = await AIUsage.create({
      userId,
      toolId,
      periodStart,
      periodEnd,
      count: 0,
    });
  }

  return usage;
};

/**
 * Get entitlement status summary for a single tool.
 */
export const getSingleToolEntitlement = async (userId, toolId) => {
  const subscription = await getUserActiveSubscription(userId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod(subscription);
  const limit = getToolLimit(subscription, toolId);
  const usageRecord = await getToolUsageRecord(userId, toolId, periodStart, periodEnd);

  const consumed = usageRecord.count;
  const remaining = Math.max(0, limit - consumed);

  return {
    toolId,
    plan: subscription.plan,
    limit,
    consumed,
    remaining,
    isFree: subscription.plan === "FREE" || (subscription.plan === "INDIVIDUAL" && subscription.purchasedToolId !== toolId),
    periodStart,
    periodEnd,
  };
};

/**
 * Get overall subscription & usage summary for all 10 tools.
 */
export const getFullSubscriptionStatus = async (userId) => {
  const subscription = await getUserActiveSubscription(userId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod(subscription);

  const toolsSummary = await Promise.all(
    AI_TOOLS.map(async (tool) => {
      const limit = getToolLimit(subscription, tool.id);
      const usageRecord = await getToolUsageRecord(userId, tool.id, periodStart, periodEnd);
      const consumed = usageRecord.count;
      const remaining = Math.max(0, limit - consumed);

      return {
        id: tool.id,
        name: tool.name,
        icon: tool.icon,
        description: tool.description,
        limit,
        consumed,
        remaining,
        isFreeLimit: subscription.plan === "FREE" || (subscription.plan === "INDIVIDUAL" && subscription.purchasedToolId !== tool.id),
      };
    })
  );

  return {
    plan: subscription.plan,
    purchasedToolId: subscription.purchasedToolId,
    status: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    periodStart,
    periodEnd,
    tools: toolsSummary,
  };
};

/**
 * Atomically check usage and increment count if within limits.
 */
export const checkAndIncrementUsage = async (userId, toolId) => {
  const subscription = await getUserActiveSubscription(userId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod(subscription);
  const limit = getToolLimit(subscription, toolId);

  const usageRecord = await getToolUsageRecord(userId, toolId, periodStart, periodEnd);

  if (usageRecord.count >= limit) {
    return {
      allowed: false,
      limit,
      consumed: usageRecord.count,
      remaining: 0,
      plan: subscription.plan,
      message: `AI usage limit reached (${limit}/${limit}) for ${toolId}. Please upgrade your plan to continue.`,
    };
  }

  // Increment usage count atomically
  usageRecord.count += 1;
  await usageRecord.save();

  return {
    allowed: true,
    limit,
    consumed: usageRecord.count,
    remaining: limit - usageRecord.count,
    plan: subscription.plan,
  };
};
