
import express from "express";

import {

  createReview,

  getUserReviews,

  editReview,

  deleteReview,

} from "./review.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

// CREATE REVIEW

router.post(
  "/",
  protect,
  createReview
);

// GET USER REVIEWS

router.get(
  "/:userId",
  protect,
  getUserReviews
);

// EDIT & DELETE REVIEW (NEW)
router.put("/:id", protect, editReview);
router.delete("/:id", protect, deleteReview);

export default router;
