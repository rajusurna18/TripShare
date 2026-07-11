import express from "express";
import {
  getTimeline,
  createOrUpdateNote,
  addLocationCheckpoint,
  generateAITravelStory,
  editTimelineEvent,
  deleteTimelineEvent
} from "./timeline.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:tripId", protect, getTimeline);
router.post("/:tripId/notes", protect, createOrUpdateNote);
router.post("/:tripId/locations", protect, addLocationCheckpoint);
router.post("/:tripId/ai-story", protect, generateAITravelStory);

// EDIT & DELETE TIMELINE EVENT (NEW)
router.put("/:tripId/events/:eventId", protect, editTimelineEvent);
router.delete("/:tripId/events/:eventId", protect, deleteTimelineEvent);

export default router;
