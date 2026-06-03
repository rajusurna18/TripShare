
import express from "express";

import {

  createReview,

  getUserReviews,

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

export default router;
