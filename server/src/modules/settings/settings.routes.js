import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  updatePreferences,
  changePassword,
  requestEmailChange,
  verifyEmailChange,
  blockUser,
  unblockUser,
  getBlockedUsers,
  clearAIHistory,
  logoutAllDevices,
  deactivateAccount,
  deleteAccount,
} from "./settings.controller.js";

const router = express.Router();

// Apply protect middleware to all settings routes
router.use(protect);

router.put("/preferences", updatePreferences);
router.post("/change-password", changePassword);
router.post("/change-email/request", requestEmailChange);
router.post("/change-email/verify", verifyEmailChange);
router.get("/blocked-users", getBlockedUsers);
router.post("/block/:id", blockUser);
router.delete("/block/:id", unblockUser);
router.post("/logout-all-devices", logoutAllDevices);
router.post("/deactivate", deactivateAccount);
router.delete("/account", deleteAccount);
router.delete("/ai/history", clearAIHistory);

export default router;
