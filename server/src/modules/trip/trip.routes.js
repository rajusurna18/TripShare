import express from "express";

import {

  createTrip,

  getTrips,

  joinTrip,

  getTripById,

} from "./trip.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../middleware/upload.middleware.js";

const router = express.Router();

// CREATE TRIP

router.post(
  "/",
  protect,
  upload.single("image"),
  createTrip
);

// GET ALL TRIPS

router.get(
  "/",
  getTrips
);

// GET SINGLE TRIP

router.get(
  "/:id",
  protect,
  getTripById
);

// JOIN TRIP

router.post(
  "/:id/join",
  protect,
  joinTrip
);

export default router;