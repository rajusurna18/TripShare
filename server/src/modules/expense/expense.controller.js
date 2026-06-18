import {
  createExpenseService,
  getTripExpensesService,
  calculateBalancesService,
} from "./expense.service.js";

import Trip from "../trip/trip.model.js";

// CREATE EXPENSE

export const createExpense =
  async (req, res) => {

    try {

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

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

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

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

      const trip = await Trip.findById(req.params.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const isCreator = trip.createdBy.toString() === req.user.id.toString();
      const isMember = trip.members.some(
        (member) => member.toString() === req.user.id.toString()
      );

      if (!isCreator && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not a member of this trip",
        });
      }

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