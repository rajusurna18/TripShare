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
        "name profileImage"
      )

      .populate(
        "splitAmong",
        "name profileImage"
      )

      .sort({
        createdAt: -1,
      });

};

// CALCULATE BALANCES

export const calculateBalancesService =
  async (tripId) => {

    // GET TRIP

    const trip =
      await Trip.findById(tripId)

        .populate(
          "members",
          "name profileImage"
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
          "name profileImage"
        );

    // EMPTY STATE

    if (
      expenses.length === 0
    ) {

      return {

        total: 0,

        perPerson: 0,

        totalExpenses: 0,

        totalTravelers:
          trip.members.length,

        balances: [],

        recentExpenses: [],

      };

    }

    // TOTAL EXPENSE

    const total =
      expenses.reduce(

        (sum, exp) =>

          sum + exp.amount,

        0

      );

    // MEMBER COUNT SAFETY

    const memberCount =
      trip.members.length || 1;

    // PER PERSON SHARE

    const perPerson =
      total / memberCount;

    // PAYMENT TRACKER

    const paidMap = {};

    trip.members.forEach(
      (member) => {

        paidMap[
          member._id
        ] = 0;

      }
    );

    // TRACK PAYMENTS

    expenses.forEach(
      (exp) => {

        const payerId =
          exp.paidBy._id
            .toString();

        paidMap[payerId] +=
          exp.amount;

      }
    );

    // FINAL BALANCES

    const balances = [];

    trip.members.forEach(
      (member) => {

        const memberId =
          member._id.toString();

        const paid =
          paidMap[
            memberId
          ];

        const balance =
          paid - perPerson;

        balances.push({

          user:
            member.name,

          profileImage:
            member.profileImage,

          paid,

          balance:
            Number(
              balance.toFixed(2)
            ),

          status:

            balance > 0

              ? "gets back"

              : balance < 0

              ? "owes"

              : "settled",

        });

      }
    );

    // RECENT EXPENSES

    const recentExpenses =
      expenses
        .slice(0, 5)
        .map((exp) => ({

          title:
            exp.title,

          amount:
            exp.amount,

          paidBy:
            exp.paidBy.name,

          createdAt:
            exp.createdAt,

        }));

    return {

      total,

      perPerson:
        Number(
          perPerson.toFixed(2)
        ),

      totalExpenses:
        expenses.length,

      totalTravelers:
        memberCount,

      balances,

      recentExpenses,

    };

};