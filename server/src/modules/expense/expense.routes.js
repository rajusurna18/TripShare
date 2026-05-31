import express from "express";

import {
  createExpense,
  getTripExpenses,
  calculateBalances,
} from "./expense.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";

const router = express.Router();

// CREATE EXPENSE

router.post(
  "/:tripId",
  protect,
  createExpense
);

// GET ALL EXPENSES OF A TRIP

router.get(
  "/:tripId",
  protect,
  getTripExpenses
);

// GET BALANCE SUMMARY

router.get(
  "/balance/:tripId",
  protect,
  calculateBalances
);

export default router;