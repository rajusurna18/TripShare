import express from "express";

import {
  createExpense,
  getTripExpenses,
  calculateBalances,
} from "./expense.controller.js";

const router = express.Router();

router.post("/", createExpense);

router.get("/:tripId", getTripExpenses);

router.get("/:tripId/balances", calculateBalances);

export default router;