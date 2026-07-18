import Trip from "../trip/trip.model.js";
import {
  getTimelineService,
  createOrUpdateNoteService,
  addLocationCheckpointService,
  generateAITravelStoryService,
  editTimelineEventService,
  deleteTimelineEventService
} from "./timeline.service.js";

// MIDDLEWARE CHECK: AUTHORIZE TRIP MEMBER OR OWNER
const checkTripAccess = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  const isCreator = trip.createdBy.toString() === userId.toString();
  const isMember = trip.members.some(m => m.toString() === userId.toString());
  return (isCreator || isMember) ? trip : null;
};

// GET TIMELINE FOR TRIP
export const getTimeline = async (req, res) => {
  try {
    const { tripId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const timeline = await getTimelineService(tripId);
    res.status(200).json({
      success: true,
      ...timeline
    });
  } catch (err) {
    console.error("GET TIMELINE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to load travel timeline"
    });
  }
};

// CREATE OR UPDATE CUSTOM NOTE EVENT
export const createOrUpdateNote = async (req, res) => {
  try {
    const { tripId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const noteEvent = await createOrUpdateNoteService(tripId, req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Day note saved successfully",
      noteEvent
    });
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to save day note"
    });
  }
};

// LOG LOCATION CHECKPOINT
export const addLocationCheckpoint = async (req, res) => {
  try {
    const { tripId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const locationEvent = await addLocationCheckpointService(tripId, req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Location checkpoint added to timeline",
      locationEvent
    });
  } catch (err) {
    console.error("ADD LOCATION CHECKPOINT ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to log location checkpoint"
    });
  }
};

// GENERATE AI TRAVEL STORY & TRIP SUMMARY
export const generateAITravelStory = async (req, res) => {
  try {
    const { tripId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const storyResult = await generateAITravelStoryService(tripId);
    res.status(200).json({
      success: true,
      message: "AI travel story generated and saved to timeline",
      ...storyResult
    });
  } catch (err) {
    console.error("GENERATE AI TRAVEL STORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Gemini AI failed to compile travel story"
    });
  }
};

// EDIT EVENT (NEW)
export const editTimelineEvent = async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const updatedEvent = await editTimelineEventService(tripId, eventId, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Timeline event updated successfully",
      updatedEvent
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE EVENT (NEW)
export const deleteTimelineEvent = async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const hasAccess = await checkTripAccess(tripId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip"
      });
    }

    const result = await deleteTimelineEventService(tripId, eventId, req.user.id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
