import express from "express";

import {

  generateItinerary,

  chatWithAI,

} from "./ai.controller.js";

const router =
  express.Router();

// AI ITINERARY

router.post(

  "/itinerary",

  generateItinerary

);

// AI CHAT

router.post(

  "/chat",

  chatWithAI

);

export default router;