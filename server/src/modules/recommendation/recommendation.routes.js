import express from "express";

import {
  getRecommendations,
} from "./recommendation.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { checkAIEntitlement } from "../ai/aiEntitlement.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  checkAIEntitlement("recommendations"),
  getRecommendations
);

export default router;