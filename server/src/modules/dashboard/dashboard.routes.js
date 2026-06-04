import express from "express";

import {
  getDashboardStats,
} from "./dashboard.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router =
  express.Router();

// GET DASHBOARD STATS

router.get(

  "/",

  protect,

  getDashboardStats

);

export default router;