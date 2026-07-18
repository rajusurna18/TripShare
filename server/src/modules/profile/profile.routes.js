import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import {
  getProfile,
  updateProfile,
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowersList,
  getFollowingList,
  getDiscoverTravelers,
} from "./profile.controller.js";

const router = express.Router();

// MY PROFILE
router.get("/", protect, getProfile);

// UPDATE PROFILE
router.put("/", protect, upload.single("profileImage"), updateProfile);

// TRAVELER DISCOVERY
router.get("/discover", protect, getDiscoverTravelers);

// PUBLIC PROFILE
router.get("/public/:userId", protect, getPublicProfile);

// FOLLOW / UNFOLLOW
router.post("/follow/:userId", protect, followUser);
router.post("/unfollow/:userId", protect, unfollowUser);

// FOLLOWERS / FOLLOWING LISTS
router.get("/followers/:userId", protect, getFollowersList);
router.get("/following/:userId", protect, getFollowingList);

export default router;