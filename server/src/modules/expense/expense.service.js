import Expense from "./expense.model.js";
import Trip from "../trip/trip.model.js";
import genAI from "../../config/gemini.js";
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

// INITIALIZE AI MODEL
const insightsModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are TripShare AI Financial Advisor. You specialize in analyzing group travel budgets, explaining settlement paths, and identifying anomalies or suspicious transactions in expense logs. Output must be structured JSON. Keep suggestions actionable. Do not output markdown code fences, standard conversational text, or any outer wrappers. Output raw JSON only.",
  generationConfig: { responseMimeType: "application/json" }
});

// SIMPLIFIED TRANSACTIONS SYSTEM
export const calculateSimplifiedTransactionsService = (balancesData) => {
  const debtors = [];
  const creditors = [];

  balancesData.balances.forEach(b => {
    if (b.balance < 0) {
      debtors.push({ name: b.user, amount: Math.abs(b.balance) });
    } else if (b.balance > 0) {
      creditors.push({ name: b.user, amount: b.balance });
    }
  });

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  // Sort descending to settle largest debts first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amountToPay = Math.min(debtor.amount, creditor.amount);
    if (amountToPay > 0.01) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amountToPay.toFixed(2))
      });
    }

    debtor.amount -= amountToPay;
    creditor.amount -= amountToPay;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  return transactions;
};

// AI INSIGHTS
export const getExpenseAIInsightsService = async (tripId) => {
  const trip = await Trip.findById(tripId).populate("members", "name");
  if (!trip) {
    throw new Error("Trip not found");
  }

  const expenses = await Expense.find({ trip: tripId }).populate("paidBy", "name").populate("splitAmong", "name");
  const balancesData = await calculateBalancesService(tripId);

  // Compute simplified settlement path
  const simplifiedTransactions = calculateSimplifiedTransactionsService(balancesData);

  // Heuristic Fraud & Anomaly Checks
  const anomalies = [];
  
  // 1. Duplicate checks within 10 minutes
  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const e1 = expenses[i];
      const e2 = expenses[j];
      const timeDiff = Math.abs(new Date(e1.createdAt) - new Date(e2.createdAt));
      if (
        e1.amount === e2.amount &&
        e1.category === e2.category &&
        timeDiff < 10 * 60 * 1000
      ) {
        anomalies.push({
          type: "Duplicate",
          message: `Possible Duplicate: "${e1.title}" (₹${e1.amount}) by ${e1.paidBy?.name} and "${e2.title}" (₹${e2.amount}) created close to each other.`
        });
      }
    }
  }

  // 2. High budget threshold spikes
  const categorySums = {};
  expenses.forEach(e => {
    categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
  });

  Object.keys(categorySums).forEach(cat => {
    if (trip.budget && categorySums[cat] > trip.budget * 0.5) {
      anomalies.push({
        type: "HighSpend",
        message: `High Category Spend: "${cat}" consumes ${Math.round((categorySums[cat]/trip.budget)*100)}% of total trip budget (₹${categorySums[cat]} spent).`
      });
    }
  });

  // Compile prompt context
  const memberNames = trip.members.map(m => m.name);
  const prompt = `
  Evaluate these travel group expenses.
  Trip Name: ${trip.title}
  Total Budget: ₹${trip.budget || 0}
  Members: ${memberNames.join(", ")}

  Current Balances:
  ${JSON.stringify(balancesData.balances)}

  Simplified Transactions Plan:
  ${JSON.stringify(simplifiedTransactions)}

  Pre-analyzed Heuristic Fraud Flags:
  ${JSON.stringify(anomalies)}

  Raw Expense Log Summaries (JSON):
  ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category, paidBy: e.paidBy?.name })))}

  Evaluate and return a JSON object with:
  1. "settlementExplanation": Friendly explanation text summarizing why the plan minimizes transaction counts.
  2. "spendersAnalysis": Object detailing "highestSpender", "lowestSpender", "status" ("Under Budget" or "Over Budget"), and "tips".
  3. "budgetAdviser": Array of 5 cost saving suggestions specific to categories and destination.
  4. "fraudNarrative": Narrative evaluating the pre-analyzed anomalies (or confirming none are detected).
  `;

  // Call Gemini API
  const textResponse = await insightsModel.generateContent(prompt);
  const parsedAIResponse = JSON.parse(textResponse.response.text());

  // Aggregate Chart Datasets
  // Category Shares
  const categoryChart = Object.keys(categorySums).map(cat => ({
    name: cat,
    value: categorySums[cat]
  }));

  // Member Contributions
  const memberSums = {};
  balancesData.balances.forEach(b => {
    memberSums[b.user] = b.paid;
  });
  const memberChart = Object.keys(memberSums).map(user => ({
    name: user,
    value: memberSums[user]
  }));

  // Daily Spends timeline
  const dailySums = {};
  expenses.forEach(e => {
    const dayStr = new Date(e.createdAt).toISOString().split("T")[0];
    dailySums[dayStr] = (dailySums[dayStr] || 0) + e.amount;
  });
  const dailyChart = Object.keys(dailySums).map(day => ({
    date: day,
    value: dailySums[day]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    narrative: parsedAIResponse.settlementExplanation || "No explanation provided.",
    spenders: parsedAIResponse.spendersAnalysis || { highestSpender: "N/A", lowestSpender: "N/A", status: "N/A", tips: "" },
    budgetAdviser: parsedAIResponse.budgetAdviser || [],
    fraudNarrative: parsedAIResponse.fraudNarrative || "No suspicious entries flagged.",
    simplifiedTransactions,
    charts: {
      categoryChart,
      memberChart,
      dailyChart
    },
    anomalies
  };
};