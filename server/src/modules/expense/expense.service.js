import Expense from "./expense.model.js";

import Trip from "../trip/trip.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

// CREATE EXPENSE

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

// GET TRIP EXPENSES

export const getTripExpensesService =
  async (tripId) => {

    return await Expense.find({

      trip: tripId,

    })

      .populate(
        "paidBy",
        "name"
      )

      .populate(
        "splitAmong",
        "name"
      );

};

// CALCULATE BALANCES

export const calculateBalancesService =
  async (tripId) => {

    // GET TRIP

    const trip =
      await Trip.findById(tripId)

        .populate(
          "members",
          "name"
        );

    // CHECK TRIP

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    // GET EXPENSES

    const expenses =
      await Expense.find({

        trip: tripId,

      })

        .populate(
          "paidBy",
          "name"
        );

    // TOTAL EXPENSE

    let total = 0;

    expenses.forEach((exp) => {

      total += exp.amount;

    });

    // MEMBER COUNT SAFETY

    const memberCount =
      trip.members.length || 1;

    // PER PERSON SHARE

    const perPerson =
      total / memberCount;

    // PAYMENT TRACKER

    const paidMap = {};

    trip.members.forEach((member) => {

      paidMap[member._id] = 0;

    });

    // TRACK PAYMENTS

    expenses.forEach((exp) => {

      paidMap[exp.paidBy._id] +=
        exp.amount;

    });

    // FINAL BALANCES

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