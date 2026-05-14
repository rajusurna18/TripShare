import Expense from "./expense.model.js";
import Trip from "../trip/trip.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

export const createExpenseService =
  async (data) => {

    const expense =
      await Expense.create(data);

    // 🔔 Notification

    await createNotificationService(
      data.paidBy,
      "Expense added successfully 💸"
    );

    return expense;
};

export const getTripExpensesService =
  async (tripId) => {

    return await Expense.find({
      trip: tripId,
    })
      .populate("paidBy", "name")
      .populate("splitAmong", "name");
};

export const calculateBalancesService =
  async (tripId) => {

    // Get trip

    const trip =
      await Trip.findById(tripId)
        .populate("members", "name");

    // Get expenses

    const expenses =
      await Expense.find({
        trip: tripId,
      }).populate("paidBy", "name");

    // Total amount

    let total = 0;

    expenses.forEach((exp) => {

      total += exp.amount;
    });

    // Per person share

    const perPerson =
      total / trip.members.length;

    // Track payments

    const paidMap = {};

    trip.members.forEach((member) => {

      paidMap[member._id] = 0;
    });

    expenses.forEach((exp) => {

      paidMap[exp.paidBy._id] += exp.amount;
    });

    // Final balances

    const balances = [];

    trip.members.forEach((member) => {

      const paid =
        paidMap[member._id];

      const balance =
        paid - perPerson;

      balances.push({

        user: member.name,

        paid,

        balance,
      });
    });

    return {

      total,

      perPerson,

      balances,
    };
};