import {
  sendFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  cancelFriendRequestService,
  removeFriendService,
  getFriendsService,
  getPendingRequestsService,
  getSentRequestsService,
  getSuggestedTravelersService,
} from "./friend.service.js";

// SEND REQUEST
export const sendFriendRequest = async (req, res) => {
  try {
    const request = await sendFriendRequestService(
      req.user.id,
      req.body.receiver
    );
    res.status(201).json({
      success: true,
      message: "Friend request sent",
      request,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ACCEPT REQUEST
export const acceptFriendRequest = async (req, res) => {
  try {
    const request = await acceptFriendRequestService(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: "Friend request accepted",
      request,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// REJECT REQUEST
export const rejectFriendRequest = async (req, res) => {
  try {
    const request = await rejectFriendRequestService(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: "Friend request rejected",
      request,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// CANCEL REQUEST (NEW)
export const cancelFriendRequest = async (req, res) => {
  try {
    const result = await cancelFriendRequestService(
      req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: "Friend request cancelled",
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// REMOVE FRIEND (NEW)
export const removeFriend = async (req, res) => {
  try {
    const result = await removeFriendService(
      req.user.id,
      req.params.friendId
    );
    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET FRIENDS (SEARCHABLE & PAGINATED)
export const getFriends = async (req, res) => {
  try {
    const { query, page, limit } = req.query;
    const result = await getFriendsService(req.user.id, { query, page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET PENDING REQUESTS (RECEIVED - SEARCHABLE & PAGINATED)
export const getPendingRequests = async (req, res) => {
  try {
    const { query, page, limit } = req.query;
    const result = await getPendingRequestsService(req.user.id, { query, page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET SENT REQUESTS (SEARCHABLE & PAGINATED - NEW)
export const getSentRequests = async (req, res) => {
  try {
    const { query, page, limit } = req.query;
    const result = await getSentRequestsService(req.user.id, { query, page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET FRIEND SUGGESTIONS (SEARCHABLE & PAGINATED - NEW)
export const getFriendSuggestions = async (req, res) => {
  try {
    const { query, page, limit } = req.query;
    const result = await getSuggestedTravelersService(req.user.id, { query, page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};