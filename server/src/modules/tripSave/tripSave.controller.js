import {
  saveTripService,
  unsaveTripService,
  getSavedTripsService,
  shareTripService,
  getShareAnalyticsService,
} from "./tripSave.service.js";

// SAVE TRIP
export const saveTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    const save = await saveTripService(tripId, userId);
    return res.status(201).json({
      success: true,
      message: "Trip saved successfully to bookmarks",
      save,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UNSAVE TRIP
export const unsaveTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    await unsaveTripService(tripId, userId);
    return res.status(200).json({
      success: true,
      message: "Trip removed from bookmarks",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SAVED TRIPS
export const getSavedTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, search, budgetMax, travelStyle, status } = req.query;

    const result = await getSavedTripsService(userId, {
      page,
      limit,
      search,
      budgetMax,
      travelStyle,
      status,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SHARE TRIP
export const shareTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { platform } = req.body;
    const userId = req.user?.id || null; // Support guest users
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    if (!platform || !["whatsapp", "instagram", "copy_link"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Valid platform is required (whatsapp, instagram, copy_link)",
      });
    }

    const share = await shareTripService(tripId, userId, platform, ipAddress);

    return res.status(201).json({
      success: true,
      message: "Share logged successfully",
      share,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SHARE ANALYTICS (HOST ONLY)
export const getShareAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await getShareAnalyticsService(userId);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
