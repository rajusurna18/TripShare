import express from "express";

import {

  getRecommendations,

} from "./recommendation.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

router.get(

  "/",

  protect,

  getRecommendations

);

export default router;