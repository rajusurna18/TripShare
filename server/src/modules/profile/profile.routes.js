import express from "express";

import {
  getProfile,
  updateProfile,
} from "./profile.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../middleware/upload.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getProfile
);

router.put(
  "/",
  protect,
  upload.single("profileImage"),
  updateProfile
);

export default router;