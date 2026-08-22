import express from "express";
import {
  generatePackingList,
  getPackingList,
  togglePackingItem,
} from "./aiPacking.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { checkAIEntitlement } from "./aiEntitlement.middleware.js";

const router = express.Router();

// AI packing checklist endpoints
router.post("/:tripId/generate", protect, checkAIEntitlement("packing"), generatePackingList);
router.get("/:tripId", protect, getPackingList);
router.put("/:tripId/toggle", protect, togglePackingItem);

export default router;
