import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    title: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    splitAmong: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model(
  "Expense",
  expenseSchema
);