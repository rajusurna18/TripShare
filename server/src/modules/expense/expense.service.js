import Expense from "./expense.model.js";

export const createExpenseService = async (
  data
) => {

  const expense = await Expense.create(data);

  return expense;
};

export const getTripExpensesService = async (
  tripId
) => {

  return await Expense.find({
    trip: tripId,
  })
    .populate("paidBy", "name")
    .populate("splitAmong", "name");
};

export const calculateBalancesService =
  async (tripId) => {

    const expenses = await Expense.find({
      trip: tripId,
    }).populate("paidBy", "name");

    const balances = {};

    expenses.forEach((expense) => {

      const splitAmount =
        expense.amount /
        expense.splitAmong.length;

      expense.splitAmong.forEach((userId) => {

        const id = userId.toString();

        if (!balances[id]) {
          balances[id] = 0;
        }

        balances[id] -= splitAmount;
      });

      const paidById =
        expense.paidBy._id.toString();

      if (!balances[paidById]) {
        balances[paidById] = 0;
      }

      balances[paidById] += expense.amount;
    });

    return balances;
  };