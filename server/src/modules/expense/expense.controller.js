import {
  createExpenseService,
  getTripExpensesService,
  calculateBalancesService,
} from "./expense.service.js";

export const createExpense = async (
  req,
  res
) => {

  try {

    const expense =
      await createExpenseService(req.body);

    res.json(expense);

  } catch (err) {

    res.status(400).json({
      message: err.message,
    });
  }
};

export const getTripExpenses = async (
  req,
  res
) => {

  try {

    const expenses =
      await getTripExpensesService(
        req.params.tripId
      );

    res.json(expenses);

  } catch (err) {

    res.status(400).json({
      message: err.message,
    });
  }
};

export const calculateBalances = async (
  req,
  res
) => {

  try {

    const balances =
      await calculateBalancesService(
        req.params.tripId
      );

    res.json(balances);

  } catch (err) {

    res.status(400).json({
      message: err.message,
    });
  }
};