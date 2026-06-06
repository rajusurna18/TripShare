import express from "express";

import {

  createMemory,

  getTripMemories,

  likeMemory,

} from "./memory.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

import upload
from "../../middleware/upload.middleware.js";

const router =
  express.Router();

router.post(

  "/:tripId",

  protect,

  upload.single("image"),

  createMemory

);

router.get(

  "/:tripId",

  protect,

  getTripMemories

);

router.put(

  "/like/:id",

  protect,

  likeMemory

);

export default router;