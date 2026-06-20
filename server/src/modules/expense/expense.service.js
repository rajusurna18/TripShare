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

      `/expenses/${data.trip}`,

      data.paidBy

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
        )
        .populate(
          "splitAmong",
          "_id"
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
    const owedMap = {};

    trip.members.forEach(
      (member) => {
        const idStr = member._id.toString();
        paidMap[idStr] = 0;
        owedMap[idStr] = 0;
      }
    );

    expenses.forEach(
      (exp) => {
        const payerId =
          exp.paidBy._id
            .toString();

        if (paidMap[payerId] !== undefined) {
          paidMap[payerId] += exp.amount;
        }

        // Determine split members (fallback to all members if empty)
        const splitList = exp.splitAmong && exp.splitAmong.length > 0
          ? exp.splitAmong
          : trip.members;

        const splitCount = splitList.length || 1;
        const share = exp.amount / splitCount;

        splitList.forEach((member) => {
          const memberIdStr = member._id ? member._id.toString() : member.toString();
          if (owedMap[memberIdStr] !== undefined) {
            owedMap[memberIdStr] += share;
          }
        });
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
          ] || 0;

        const owed =
          owedMap[
            memberId
          ] || 0;

        const balance =
          paid - owed;

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