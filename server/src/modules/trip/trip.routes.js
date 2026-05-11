import express from "express";

import {
  createTrip,
  getTrips,
  joinTrip,
} from "./trip.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import upload
from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protect, createTrip);

router.get("/", getTrips);

router.post("/:id/join", protect, joinTrip);

router.post(
  "/",
  protect,
  upload.single("image"),
  createTrip
);

export default router;