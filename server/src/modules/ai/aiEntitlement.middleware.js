import { checkAndIncrementUsage } from "./aiEntitlement.service.js";

/**
 * Express middleware to enforce AI usage limits per tool.
 */
export const checkAIEntitlement = (toolId) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await checkAndIncrementUsage(userId, toolId);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          code: "USAGE_LIMIT_EXCEEDED",
          message: result.message,
          toolId,
          limit: result.limit,
          consumed: result.consumed,
          remaining: 0,
          plan: result.plan,
        });
      }

      req.aiEntitlement = result;
      next();
    } catch (err) {
      console.error(`AI Entitlement Middleware Error (${toolId}):`, err);
      // Fail safely without letting unhandled errors break the request
      return res.status(500).json({
        success: false,
        message: "Unable to verify AI subscription entitlement",
      });
    }
  };
};
