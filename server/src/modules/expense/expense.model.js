import mongoose from "mongoose";

const expenseSchema =
  new mongoose.Schema(

    {

      // TRIP

      trip: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Trip",

        required: true,

      },

      // TITLE

      title: {

        type: String,

        required: true,

        trim: true,

      },

      // AMOUNT

      amount: {

        type: Number,

        required: true,

        min: 1,

      },

      // WHO PAID

      paidBy: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      // SPLIT MEMBERS

      splitAmong: [

        {

          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",

        },

      ],

      // CATEGORY

      category: {

        type: String,

        default: "General",

      },

      // PAYMENT METHOD

      paymentMethod: {

        type: String,

        default: "Cash",

      },

      // NOTE

      note: {

        type: String,

        default: "",

      },

    },

    {

      timestamps: true,

    }

  );

// FAST FETCH

expenseSchema.index({

  trip: 1,

  createdAt: -1,

});

export default mongoose.model(

  "Expense",

  expenseSchema

);