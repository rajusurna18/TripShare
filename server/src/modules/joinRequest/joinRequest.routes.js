import express from "express";

import {

  sendJoinRequest,

  getTripRequests,

  acceptJoinRequest,

  rejectJoinRequest,

} from "./joinRequest.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

// SEND REQUEST

router.post(

  "/:tripId",

  protect,

  sendJoinRequest

);

// GET REQUESTS

router.get(

  "/:tripId",

  protect,

  getTripRequests

);

// ACCEPT

router.put(

  "/accept/:id",

  protect,

  acceptJoinRequest

);

// REJECT

router.put(

  "/reject/:id",

  protect,

  rejectJoinRequest

);

export default router;