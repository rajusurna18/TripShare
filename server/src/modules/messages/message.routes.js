import express from "express";

import {

  saveMessage,

  getMessages,

} from "./message.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../config/multer.js";

const router =
  express.Router();

// SAVE MESSAGE

router.post(

  "/",

  protect,

  upload.fields([

    {

      name: "file",

      maxCount: 1,

    },

    {

      name: "audio",

      maxCount: 1,

    },

  ]),

  saveMessage

);

// GET ALL MESSAGES OF A TRIP

router.get(

  "/:tripId",

  protect,

  getMessages

);

export default router;