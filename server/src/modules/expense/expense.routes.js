import express from "express";

import {

  createExpense,

  getTripExpenses,

  calculateBalances,
  getExpenseAIInsights,

  editExpense,

  deleteExpense,

} from "./expense.controller.js";

import { protect }
from "../../middleware/auth.middleware.js";
import { aiExpenseLimiter } from "../../middleware/rateLimiters.js";

const router =
  express.Router();

// CREATE EXPENSE

router.post(

  "/:tripId",

  protect,

  createExpense

);

// GET ALL EXPENSES

router.get(

  "/:tripId",

  protect,

  getTripExpenses

);

// BALANCE SUMMARY

router.get(

  "/balance/:tripId",

  protect,

  calculateBalances

);

router.get(

  "/ai/:tripId/insights",

  protect,

  aiExpenseLimiter,

  getExpenseAIInsights

);

// EDIT & DELETE EXPENSE (NEW)
router.put("/:id", protect, editExpense);
router.delete("/:id", protect, deleteExpense);

export default router;