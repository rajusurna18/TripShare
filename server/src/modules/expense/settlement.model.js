import mongoose from "mongoose";

const settlementSchema =
  new mongoose.Schema(
    {
      trip: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true,
      },

      payer: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      receiver: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      settled: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Settlement",
  settlementSchema
);