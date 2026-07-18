import { getFeedService } from "./activity.service.js";

// GET ACTIVITIES FEED
export const getFeed = async (req, res) => {
  try {
    const { feedType, page, limit, userId } = req.query;

    const options = {
      feedType: feedType || "home",
      page: page || 1,
      limit: limit || 10,
      targetUserId: userId || null,
    };

    const result = await getFeedService(req.user.id, options);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
