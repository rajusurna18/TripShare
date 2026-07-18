import Activity from "./activity.model.js";
import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";

// LOG ACTIVITY
export const logActivityService = async (
  actorId,
  type,
  entityId,
  entityType,
  tripId = null,
  metadata = {},
  visibility = "PUBLIC"
) => {
  try {
    return await Activity.create({
      actor: actorId,
      type,
      entityId,
      entityType,
      tripId: tripId || null,
      metadata,
      visibility,
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

// GET PAGINATED FEED WITH VISIBILITY ENFORCEMENT
export const getFeedService = async (userId, options = {}) => {
  const { feedType = "home", page = 1, limit = 10, targetUserId = null } = options;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skipNum = (pageNum - 1) * limitNum;

  let query = {};

  if (feedType === "user") {
    // Return activities by specific target user (Timeline compatibility)
    const queryUser = targetUserId || userId;
    query = { actor: queryUser };
  } else if (feedType === "dashboard") {
    // Fetch personalized feed: own + following public/friends + members-only inside joined trips
    const user = await User.findById(userId).select("following");
    const followingIds = user?.following || [];

    // Find trips the current user is a part of
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    }).select("_id");
    const userTripIds = userTrips.map(t => t._id);

    query = {
      $or: [
        { actor: userId },
        { 
          actor: { $in: followingIds }, 
          visibility: { $in: ["PUBLIC", "FRIENDS_ONLY"] } 
        },
        { 
          tripId: { $in: userTripIds }, 
          visibility: "MEMBERS_ONLY" 
        }
      ]
    };
  } else {
    // Home or landing public feeds
    query = { visibility: "PUBLIC" };
  }

  const totalResults = await Activity.countDocuments(query);
  const totalPages = Math.ceil(totalResults / limitNum);

  const activities = await Activity.find(query)
    .populate("actor", "name profileImage travelStyle isVerified")
    .populate("tripId", "title destination status members")
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(limitNum);

  return {
    activities,
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalResults,
    hasNextPage: pageNum < totalPages,
    hasPreviousPage: pageNum > 1,
  };
};
