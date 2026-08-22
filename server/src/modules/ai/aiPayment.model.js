import mongoose from "mongoose";

const aiPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    plan: {
      type: String,
      enum: ["INDIVIDUAL", "COMBO", "PRO"],
      required: true,
    },
    purchasedToolId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED"],
      default: "CREATED",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIPayment", aiPaymentSchema);
