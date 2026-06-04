import express from "express";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../middleware/upload.middleware.js";

import {
  getProfile,
  updateProfile,
  getPublicProfile,
} from "./profile.controller.js";

const router = express.Router();

// MY PROFILE

router.get(
  "/",
  protect,
  getProfile
);

// UPDATE PROFILE

router.put(
  "/",
  protect,
  upload.single("profileImage"),
  updateProfile
);

// PUBLIC PROFILE

router.get(
  "/public/:userId",
  protect,
  getPublicProfile
);

export default router;