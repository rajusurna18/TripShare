import TripSave from "./tripSave.model.js";
import TripShare from "./tripShare.model.js";
import Trip from "../trip/trip.model.js";
import User from "../auth/auth.model.js";
import { createNotificationService } from "../notification/notification.service.js";
import { logActivityService } from "../activity/activity.service.js";

// SAVE TRIP
export const saveTripService = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  // Owner validation: Prevent saving own trip
  if (trip.createdBy.toString() === userId.toString()) {
    throw new Error("You cannot save your own trip");
  }

  const existingSave = await TripSave.findOne({ user: userId, trip: tripId });
  if (existingSave) {
    return existingSave;
  }

  const save = await TripSave.create({ user: userId, trip: tripId });

  // Update cached count
  await Trip.findByIdAndUpdate(tripId, { $inc: { savesCount: 1 } });

  // Fetch actor's name
  const userSaving = await User.findById(userId).select("name");

  // Send real-time notification to owner
  await createNotificationService(
    trip.createdBy,
    `${userSaving.name} bookmarked your trip to ${trip.destination}! ⭐`,
    "trip_save",
    `/trip/${tripId}`,
    userId
  );

  // Log Activity
  await logActivityService(
    userId,
    "TRIP_SAVED",
    tripId,
    "Trip",
    tripId,
    {
      title: trip.title,
      destination: trip.destination,
      imageUrl: trip.image || "",
    },
    trip.visibility === "private" ? "MEMBERS_ONLY" : "PUBLIC"
  );

  return save;
};

// UNSAVE TRIP
export const unsaveTripService = async (tripId, userId) => {
  const existingSave = await TripSave.findOneAndDelete({ user: userId, trip: tripId });
  if (!existingSave) {
    throw new Error("Trip is not saved");
  }

  // Update cached count
  await Trip.findByIdAndUpdate(tripId, { $inc: { savesCount: -1 } });

  // Prevent negative counters
  await Trip.updateOne({ _id: tripId, savesCount: { $lt: 0 } }, { $set: { savesCount: 0 } });

  return { success: true };
};

// GET SAVED TRIPS WITH SEARCH, FILTERS & PAGINATION
export const getSavedTripsService = async (userId, options = {}) => {
  const { page = 1, limit = 10, search = "", budgetMax, travelStyle, status } = options;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  // Build search / filter matching query for Trips
  const tripQuery = {};

  if (search && search.trim() !== "") {
    tripQuery.$or = [
      { title: { $regex: search, $options: "i" } },
      { destination: { $regex: search, $options: "i" } },
    ];
  }

  if (budgetMax) {
    tripQuery.budget = { $lte: Number(budgetMax) };
  }

  if (travelStyle) {
    tripQuery.travelStyle = travelStyle;
  }

  if (status) {
    tripQuery.status = status;
  }

  // Fetch IDs of all matching trips
  const matchedTrips = await Trip.find(tripQuery).select("_id");
  const matchedTripIds = matchedTrips.map((t) => t._id);

  // Query Saves pointing to matching trips
  const saveQuery = {
    user: userId,
    trip: { $in: matchedTripIds },
  };

  const totalResults = await TripSave.countDocuments(saveQuery);
  const totalPages = Math.ceil(totalResults / limitNum);

  const saves = await TripSave.find(saveQuery)
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(limitNum)
    .populate({
      path: "trip",
      populate: [
        { path: "createdBy", select: "name email profileImage" },
        { path: "members", select: "name profileImage travelStyle" },
      ],
    });

  return {
    saves,
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalResults,
    hasNextPage: pageNum < totalPages,
  };
};

// SHARE TRIP (LOG SHARE)
export const shareTripService = async (tripId, userId, platform, ipAddress) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  const share = await TripShare.create({
    trip: tripId,
    user: userId || null,
    platform,
    ipAddress,
  });

  // Increment sharesCount cache
  await Trip.findByIdAndUpdate(tripId, { $inc: { sharesCount: 1 } });

  // Send real-time notification if user is logged in
  if (userId) {
    const userSharing = await User.findById(userId).select("name");
    await createNotificationService(
      trip.createdBy,
      `${userSharing.name} shared your trip to ${trip.destination} on ${platform}! 🔗`,
      "trip_share",
      `/trip/${tripId}`,
      userId
    );

    // Log Activity
    await logActivityService(
      userId,
      "TRIP_SHARED",
      tripId,
      "Trip",
      tripId,
      {
        title: trip.title,
        destination: trip.destination,
        platform,
      },
      trip.visibility === "private" ? "MEMBERS_ONLY" : "PUBLIC"
    );
  }

  return share;
};

// SHARE ANALYTICS FOR HOST
export const getShareAnalyticsService = async (userId) => {
  // Find all trips hosted by this user
  const userTrips = await Trip.find({ createdBy: userId }).select("_id title destination");
  const tripIds = userTrips.map((t) => t._id);

  if (tripIds.length === 0) {
    return {
      totalShares: 0,
      sharesByPlatform: [],
      sharesByTrip: [],
    };
  }

  // Aggregate by platform
  const sharesByPlatform = await TripShare.aggregate([
    { $match: { trip: { $in: tripIds } } },
    { $group: { _id: "$platform", count: { $sum: 1 } } },
    { $project: { platform: "$_id", count: 1, _id: 0 } },
  ]);

  // Aggregate by trip
  const sharesByTrip = await TripShare.aggregate([
    { $match: { trip: { $in: tripIds } } },
    { $group: { _id: "$trip", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const tripMap = {};
  userTrips.forEach((t) => {
    tripMap[t._id.toString()] = { title: t.title, destination: t.destination };
  });

  const sharesByTripWithDetails = sharesByTrip.map((item) => ({
    tripId: item._id,
    title: tripMap[item._id.toString()]?.title || "Unknown Trip",
    destination: tripMap[item._id.toString()]?.destination || "Unknown Destination",
    count: item.count,
  }));

  const totalShares = sharesByPlatform.reduce((sum, item) => sum + item.count, 0);

  return {
    totalShares,
    sharesByPlatform,
    sharesByTrip: sharesByTripWithDetails,
  };
};
