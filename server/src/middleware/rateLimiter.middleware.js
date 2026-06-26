const rateLimitCache = new Map();

/**
 * Custom memory rate limiter middleware.
 * @param {number} limit - Maximum number of requests allowed in the window.
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute).
 */
export const customRateLimiter = (limit = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    // Obtain client IP address
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const key = `${req.path}_${ip}`;
    const now = Date.now();

    if (!rateLimitCache.has(key)) {
      rateLimitCache.set(key, []);
    }

    const timestamps = rateLimitCache.get(key);

    // Keep only timestamps within the window
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);
    validTimestamps.push(now);
    rateLimitCache.set(key, validTimestamps);

    if (validTimestamps.length > limit) {
      return res.status(429).json({
        success: false,
        message: "Too many actions. Please wait a moment and try again.",
      });
    }

    next();
  };
};
