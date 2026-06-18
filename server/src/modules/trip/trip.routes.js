import express from "express";

import {
  createTrip,
  getTrips,
  joinTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  leaveTrip,
  removeMember,
  transferOwnership,
} from "./trip.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("image"),
  createTrip
);

router.get(
  "/",
  protect,
  getTrips
);

router.get(
  "/:id",
  protect,
  getTripById
);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateTrip
);

router.delete(
  "/:id",
  protect,
  deleteTrip
);

router.post(
  "/:id/join",
  protect,
  joinTrip
);

router.post(
  "/:id/leave",
  protect,
  leaveTrip
);

router.post(
  "/:id/remove-member",
  protect,
  removeMember
);

router.post(
  "/:id/transfer-ownership",
  protect,
  transferOwnership
);

export default router;
