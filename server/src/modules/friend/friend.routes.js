import express from "express";

import {

  sendFriendRequest,

  acceptFriendRequest,

  rejectFriendRequest,

  getFriends,

  getPendingRequests,

} from "./friend.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

// SEND REQUEST

router.post(

  "/send",

  protect,

  sendFriendRequest

);

// ACCEPT REQUEST

router.put(

  "/accept/:id",

  protect,

  acceptFriendRequest

);

// REJECT REQUEST

router.put(

  "/reject/:id",

  protect,

  rejectFriendRequest

);

// GET FRIENDS

router.get(

  "/",

  protect,

  getFriends

);

// GET PENDING REQUESTS

router.get(

  "/requests",

  protect,

  getPendingRequests

);

export default router;