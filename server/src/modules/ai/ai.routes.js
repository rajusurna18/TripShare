import express from "express";

import {
  generateItinerary,
} from "./ai.controller.js";

const router = express.Router();

router.post(
  "/itinerary",
  generateItinerary
);

export default router;