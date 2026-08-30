import mongoose from "mongoose";

const travelTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userRequest: {
      type: String,
      required: true,
    },
    parsedIntent: {
      destination: { type: String, required: true },
      durationDays: { type: Number, required: true },
      travelersCount: { type: Number, required: true },
      maxBudgetPerPerson: { type: Number, required: true },
      totalBudgetLimit: { type: Number, required: true },
    },
    aiRecommendation: {
      packageName: { type: String, required: true },
      destination: { type: String, required: true },
      durationDays: { type: Number, required: true },
      travelersCount: { type: Number, required: true },
      costPerPerson: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      remainingBuffer: { type: Number, required: true },
      priceBreakdown: {
        stay: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        activities: { type: Number, default: 0 },
        foodAndMisc: { type: Number, default: 0 },
      },
      explanation: [{ type: String }],
    },
    toolAction: {
      type: String,
      default: "calculateTripBudget",
    },
    budgetValidation: {
      allowed: { type: Boolean, required: true },
      status: { type: String, enum: ["ALLOWED", "BLOCKED"], required: true },
      maxBudget: { type: Number, required: true },
      calculatedTotal: { type: Number, required: true },
      difference: { type: Number, required: true },
      policyReason: { type: String, required: true },
    },
    userConfirmed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PROPOSED", "CREATED", "PENDING", "SUCCESS", "CANCELLED", "FAILED", "BLOCKED"],
      default: "PROPOSED",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignatureVerified: {
      type: Boolean,
      default: false,
    },
    auditTrail: [
      {
        timestamp: { type: Date, default: Date.now },
        stage: { type: String, required: true },
        message: { type: String, required: true },
        details: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const TravelTransaction = mongoose.model("TravelTransaction", travelTransactionSchema);

export default TravelTransaction;
