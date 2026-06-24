import express from "express";

import {

  createMemory,

  getTripMemories,

  likeMemory,

  createComment,

  createReply,

  getMemoryComments,

  deleteComment,

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

// COMMENTS & REPLIES ROUTES
router.post(
  "/:id/comments",
  protect,
  createComment
);

router.post(
  "/:id/comments/:commentId/replies",
  protect,
  createReply
);

router.get(
  "/:id/comments",
  protect,
  getMemoryComments
);

router.delete(
  "/comments/:commentId",
  protect,
  deleteComment
);

export default router;