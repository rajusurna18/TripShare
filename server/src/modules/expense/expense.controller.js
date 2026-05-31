import {
  createExpenseService,
  getTripExpensesService,
  calculateBalancesService,
} from "./expense.service.js";

// CREATE EXPENSE

export const createExpense =
  async (req, res) => {

    try {

      const expense =
        await createExpenseService({

          ...req.body,

          trip:
            req.params.tripId,

          paidBy:
            req.user.id,

        });

      res.status(201).json({

        success: true,

        message:
          "Expense added successfully",

        expense,

      });

    } catch (err) {

      console.log(err);

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// GET TRIP EXPENSES

export const getTripExpenses =
  async (req, res) => {

    try {

      const expenses =
        await getTripExpensesService(
          req.params.tripId
        );

      res.status(200).json({

        success: true,

        totalExpenses:
          expenses.length,

        expenses,

      });

    } catch (err) {

      console.log(err);

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};

// CALCULATE BALANCES

export const calculateBalances =
  async (req, res) => {

    try {

      const balances =
        await calculateBalancesService(
          req.params.tripId
        );

      res.status(200).json({

        success: true,

        ...balances,

      });

    } catch (err) {

      console.log(err);

      res.status(400).json({

        success: false,

        message:
          err.message,

      });

    }

};