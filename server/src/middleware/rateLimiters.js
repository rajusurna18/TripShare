import { rateLimit } from "express-rate-limit";

export const authenticationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many authentication attempts, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many AI Chat requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiPackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many AI Packing list requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiExpenseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many AI Expense requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const blogsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: "Too many blog requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const tripsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many trip requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const messagesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, message: "Too many message requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
