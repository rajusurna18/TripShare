import {
  generatePackingListService,
  getPackingListService,
  togglePackingItemService,
} from "./aiPacking.service.js";
import Trip from "../trip/trip.model.js";

const verifyTripMembership = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return false;
  }
  const isCreator = trip.createdBy.toString() === userId.toString();
  const isMember = trip.members.some(m => m.toString() === userId.toString());
  return isCreator || isMember;
};

// GENERATE PACKING LIST
export const generatePackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const hasAccess = await verifyTripMembership(tripId, userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip",
      });
    }

    const list = await generatePackingListService(tripId, userId, req.body);
    res.status(200).json({
      success: true,
      packingList: list,
    });
  } catch (err) {
    console.log("GENERATE PACKING LIST ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate packing list",
    });
  }
};

// GET PACKING LIST
export const getPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const hasAccess = await verifyTripMembership(tripId, userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip",
      });
    }

    const list = await getPackingListService(tripId, userId);
    res.status(200).json({
      success: true,
      packingList: list,
    });
  } catch (err) {
    console.log("GET PACKING LIST ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve packing list",
    });
  }
};

// TOGGLE ITEM CHECK
export const togglePackingItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { categoryName, itemId } = req.body;
    const userId = req.user.id;

    if (!categoryName || !itemId) {
      return res.status(400).json({
        success: false,
        message: "categoryName and itemId are required",
      });
    }

    const hasAccess = await verifyTripMembership(tripId, userId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not a member of this trip",
      });
    }

    const list = await togglePackingItemService(tripId, userId, categoryName, itemId);
    res.status(200).json({
      success: true,
      packingList: list,
    });
  } catch (err) {
    console.log("TOGGLE PACKING ITEM ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update item state",
    });
  }
};
