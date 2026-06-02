import express from "express";

import {

  generateAIReply,

  generateItinerary,

} from "./ai.controller.js";

const router =
  express.Router();

// AI CHAT

router.post(

  "/chat",

  generateAIReply

);

// AI ITINERARY

router.post(

  "/itinerary",

  generateItinerary

);

export default router;