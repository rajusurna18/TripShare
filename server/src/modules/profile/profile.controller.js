import {
  getProfileService,
  updateProfileService,
  getPublicProfileService,
  followUserService,
  unfollowUserService,
  getFollowersService,
  getFollowingService,
  getDiscoverTravelersService,
} from "./profile.service.js";

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const simple = req.query.simple === "true";
    const user = await getProfileService(req.user.id, simple);
    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// PUBLIC PROFILE
export const getPublicProfile = async (req, res) => {
  try {
    const user = await getPublicProfileService(req.params.userId, req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    // PROFILE IMAGE
    if (req.file) {
      req.body.profileImage = req.file.path;
    }

    // INTERESTS ARRAY
    if (req.body.interests) {
      if (!Array.isArray(req.body.interests)) {
        req.body.interests = [req.body.interests];
      }
    }

    // LANGUAGES ARRAY
    if (req.body.languages) {
      if (!Array.isArray(req.body.languages)) {
        req.body.languages = [req.body.languages];
      }
    }

    // VISITED PLACES ARRAY
    if (req.body.visitedPlaces) {
      if (!Array.isArray(req.body.visitedPlaces)) {
        req.body.visitedPlaces = [req.body.visitedPlaces];
      }
    }

    const user = await updateProfileService(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const result = await followUserService(req.user.id, req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  try {
    const result = await unfollowUserService(req.user.id, req.params.userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// GET FOLLOWERS
export const getFollowersList = async (req, res) => {
  try {
    const list = await getFollowersService(req.params.userId);
    res.json(list);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// GET FOLLOWING
export const getFollowingList = async (req, res) => {
  try {
    const list = await getFollowingService(req.params.userId);
    res.json(list);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// GET DISCOVER TRAVELERS
export const getDiscoverTravelers = async (req, res) => {
  try {
    const result = await getDiscoverTravelersService(req.query, req.user?.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};