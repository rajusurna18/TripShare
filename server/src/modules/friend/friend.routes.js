import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getFriendSuggestions,
} from "./friend.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// SEND REQUEST
router.post("/send", protect, sendFriendRequest);

// ACCEPT REQUEST
router.put("/accept/:id", protect, acceptFriendRequest);

// REJECT REQUEST
router.put("/reject/:id", protect, rejectFriendRequest);

// CANCEL REQUEST (NEW)
router.delete("/cancel/:id", protect, cancelFriendRequest);

// REMOVE FRIEND (NEW)
router.delete("/remove/:friendId", protect, removeFriend);

// GET FRIENDS
router.get("/", protect, getFriends);

// GET PENDING RECEIVED REQUESTS
router.get("/requests", protect, getPendingRequests);

// GET PENDING SENT REQUESTS (NEW)
router.get("/sent-requests", protect, getSentRequests);

// GET SUGGESTIONS (NEW)
router.get("/suggestions", protect, getFriendSuggestions);

export default router;