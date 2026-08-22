import mongoose from "mongoose";

const aiSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "INDIVIDUAL", "COMBO", "PRO"],
      default: "FREE",
    },
    purchasedToolId: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AISubscription", aiSubscriptionSchema);
