import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import {
  processTravelCommerceIntent,
  createTravelOrderService,
  verifyTravelPaymentService,
  cancelTravelPaymentService,
  getTravelAuditTrailService,
} from "./src/modules/travelCommerce/travelCommerce.service.js";

// Mock User IDs
const mockUserId = new mongoose.Types.ObjectId().toString();
const wrongUserId = new mongoose.Types.ObjectId().toString();

async function runTravelCommerceTests() {
  console.log("==========================================");
  console.log("RUNNING TRAVEL COMMERCE SUITE (TRACK 01)");
  console.log("==========================================");

  await connectDB();

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = "") => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` (${detail})` : ""}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ""}`);
      failed++;
    }
  };

  try {
    // 1. VALID INTENT PARSING
    const res1 = await processTravelCommerceIntent(
      mockUserId,
      "I want a 5-day Goa trip for 3 people under ₹15,000 per person."
    );
    assert(
      res1.success && res1.agenticPackage.destination === "Goa" && res1.agenticPackage.durationDays === 5 && res1.agenticPackage.travelersCount === 3,
      "Test 1: Valid intent parsing",
      "Parsed 5-day Goa trip for 3 travelers"
    );

    // 2. WITHIN-BUDGET TRANSACTION
    assert(
      res1.agenticPackage.budgetValidation.allowed === true && res1.agenticPackage.status === "PROPOSED",
      "Test 2: Within-budget transaction",
      `₹${res1.agenticPackage.totalAmount.toLocaleString('en-IN')} <= ₹${res1.agenticPackage.totalBudgetLimit.toLocaleString('en-IN')} limit -> ALLOWED`
    );

    // 3. OVER-BUDGET TRANSACTION
    const res3 = await processTravelCommerceIntent(
      mockUserId,
      "I want a 5-day Goa trip for 3 people under ₹5,000 per person."
    );
    assert(
      res3.agenticPackage.budgetValidation.allowed === false && res3.agenticPackage.status === "BLOCKED",
      "Test 3: Over-budget transaction",
      `₹${res3.agenticPackage.totalAmount.toLocaleString('en-IN')} > ₹${res3.agenticPackage.totalBudgetLimit.toLocaleString('en-IN')} limit -> BLOCKED`
    );

    // 4. CONFIRMATION GATE
    try {
      await createTravelOrderService(mockUserId, res3.transactionId);
      assert(false, "Test 4: Confirmation gate");
    } catch (err) {
      assert(
        err.message.includes("Cannot create payment order") || err.message.includes("exceeds"),
        "Test 4: Confirmation gate",
        "Blocked over-budget order creation before user payment"
      );
    }

    // 5. RAZORPAY ORDER CREATION
    const orderRes = await createTravelOrderService(mockUserId, res1.transactionId);
    assert(
      orderRes.success && orderRes.orderId && orderRes.amount === 3735000,
      "Test 5: Razorpay order creation",
      `Created order ${orderRes.orderId} for ₹37,350`
    );

    // 6. PAYMENT CANCELLATION
    const cancelRes = await cancelTravelPaymentService(mockUserId, res1.transactionId, "User closed modal");
    assert(
      cancelRes.success && cancelRes.transaction.status === "CANCELLED",
      "Test 6: Payment cancellation",
      "State transitioned to CANCELLED cleanly"
    );

    // Create new valid transaction for verification testing
    const resVerif = await processTravelCommerceIntent(mockUserId, "Plan a 5-day Goa trip for 3 people under ₹15,000 per person.");
    const orderVerif = await createTravelOrderService(mockUserId, resVerif.transactionId);

    // 7. INVALID SIGNATURE
    try {
      await verifyTravelPaymentService(mockUserId, {
        razorpay_order_id: orderVerif.orderId,
        razorpay_payment_id: "pay_fake_123456",
        razorpay_signature: "invalid_tampered_signature_hash_9999",
      });
      assert(false, "Test 7: Invalid signature");
    } catch (err) {
      assert(
        err.message.includes("Invalid HMAC") || err.message.includes("failed"),
        "Test 7: Invalid signature",
        "Tampered signature rejected by server HMAC validator"
      );
    }

    // 8. VALID SIGNATURE
    const secret = process.env.RAZORPAY_KEY_SECRET || "a1O7NUfjlx3E7ALpVrTT4RyK";
    const paymentId = `pay_test_${Date.now()}`;
    const rawBody = `${orderVerif.orderId}|${paymentId}`;
    const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const validVerifRes = await verifyTravelPaymentService(mockUserId, {
      razorpay_order_id: orderVerif.orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });
    assert(
      validVerifRes.success && validVerifRes.transaction.status === "SUCCESS" && validVerifRes.transaction.razorpaySignatureVerified === true,
      "Test 8: Valid signature",
      "HMAC-SHA256 verified, state set to SUCCESS & Trip created"
    );

    // 9. DUPLICATE VERIFICATION (IDEMPOTENCY)
    const duplicateRes = await verifyTravelPaymentService(mockUserId, {
      razorpay_order_id: orderVerif.orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });
    assert(
      duplicateRes.success && duplicateRes.message.includes("already verified"),
      "Test 9: Duplicate verification",
      "Idempotent response returned without duplicating trip or payment"
    );

    // 10. AMOUNT MISMATCH & UNKNOWN ORDER HANDLER
    try {
      await verifyTravelPaymentService(mockUserId, {
        razorpay_order_id: "order_non_existent_99999",
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      });
      assert(false, "Test 10: Amount mismatch / unknown order");
    } catch (err) {
      assert(
        err.message.includes("Order record not found") || err.message.includes("unauthorized"),
        "Test 10: Amount mismatch / unknown order",
        "Unregistered/mismatched order ID rejected"
      );
    }

    // 11. UNAUTHORIZED ORDER VERIFICATION
    try {
      await verifyTravelPaymentService(wrongUserId, {
        razorpay_order_id: orderVerif.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      });
      assert(false, "Test 11: Unauthorized order verification");
    } catch (err) {
      assert(
        err.message.includes("not found or unauthorized"),
        "Test 11: Unauthorized order verification",
        "Non-owner user verification attempt rejected"
      );
    }

  } catch (err) {
    console.error("Test Suite execution error:", err);
  } finally {
    await mongoose.connection.close();
  }

  console.log("==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTravelCommerceTests().catch(console.error);

