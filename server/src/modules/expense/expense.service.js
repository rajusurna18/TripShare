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

    // NOTIFICATION

    await createNotificationService(

      data.paidBy,

      `Expense "${data.title}" added 💸`,

      "expense",

      `/expenses/${data.trip}`

    );

    return expense;

};

// GET EXPENSES

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

// BALANCE SYSTEM

export const calculateBalancesService =
  async (tripId) => {

    const trip =
      await Trip.findById(tripId)

        .populate(
          "members",
          "name profileImage"
        );

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    const expenses =
      await Expense.find({

        trip: tripId,

      })

        .populate(
          "paidBy",
          "name profileImage"
        );

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

      };

    }

    // TOTAL

    const total =
      expenses.reduce(

        (sum, exp) =>

          sum + exp.amount,

        0

      );

    // PER PERSON

    const memberCount =
      trip.members.length || 1;

    const perPerson =
      total / memberCount;

    // TRACK

    const paidMap = {};

    trip.members.forEach(
      (member) => {

        paidMap[
          member._id
        ] = 0;

      }
    );

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

    };

};