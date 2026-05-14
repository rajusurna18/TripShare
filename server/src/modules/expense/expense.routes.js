import express from "express";

import {
  createExpense,
  getTripExpenses,
  calculateBalances,
} from "./expense.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/:tripId",
  protect,
  createExpense
);

router.get(
  "/:tripId",
  protect,
  getTripExpenses
);

router.get(
  "/balance/:tripId",
  protect,
  calculateBalances
);

export default router;