import express from "express";

import {

  saveMessage,

  getMessages,

} from "./message.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

// SAVE MESSAGE

router.post(
  "/",
  protect,
  saveMessage
);

// GET MESSAGES

router.get(
  "/:tripId",
  protect,
  getMessages
);

export default router;