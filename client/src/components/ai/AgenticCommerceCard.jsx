import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import AuditTrailModal from "./AuditTrailModal";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaCreditCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlane,
  FaUsers,
  FaCalendarAlt,
  FaWallet,
  FaHistory,
} from "react-icons/fa";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function AgenticCommerceCard({ pkg }) {
  const navigate = useNavigate();
  const [transactionState, setTransactionState] = useState(pkg.status || "PROPOSED");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [confirmedTripId, setConfirmedTripId] = useState(null);

  const isAllowed = pkg.budgetValidation?.allowed !== false;
  const budgetLimit = pkg.totalBudgetLimit || 45000;
  const totalAmount = pkg.totalAmount || 37350;
  const remainingBuffer = pkg.remainingBuffer || Math.max(0, budgetLimit - totalAmount);
  const budgetUsedPct = Math.min(100, Math.round((totalAmount / budgetLimit) * 100));

  // EXECUTE GATED MONEY ACTION (Proceed to Payment)
  const handleProceedToPayment = async () => {
    if (!isAllowed) {
      setErrorMsg("Payment blocked: Package exceeds configured budget policy.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      // Step 1: Ensure Razorpay JS SDK loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay Checkout SDK. Check internet connection.");
      }

      // Step 2: Request server to create Razorpay Order (Confirmation Gate passed)
      const res = await API.post("/travel-commerce/order", {
        transactionId: pkg.transactionId,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create payment order.");
      }

      const orderData = res.data;
      setTransactionState("PENDING");

      // Step 3: Open Razorpay Checkout (Test Mode)
      const options = {
        key: orderData.keyId || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "TripShare AI Travel Agent",
        description: `Booking ${pkg.packageName || "Travel Package"}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            // Step 4: Server HMAC Signature Verification
            const verifyRes = await API.post("/travel-commerce/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              setTransactionState("SUCCESS");
              if (verifyRes.data.tripId) {
                setConfirmedTripId(verifyRes.data.tripId);
              }
            } else {
              setTransactionState("FAILED");
              setErrorMsg("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setTransactionState("FAILED");
            setErrorMsg(err.response?.data?.message || err.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            // Step 5: Handle cancellation gracefully
            try {
              await API.post("/travel-commerce/cancel-payment", {
                transactionId: pkg.transactionId,
                reason: "User closed Razorpay checkout modal",
              });
            } catch (e) {
              console.error("Cancel API warning:", e);
            }
            setTransactionState("CANCELLED");
            setLoading(false);
          },
        },
        prefill: {
          name: "Traveler",
          email: "traveler@tripshare.pro",
        },
        theme: {
          color: "#ffc107",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        console.error("Razorpay Payment Failed:", response.error);
        setTransactionState("FAILED");
        setErrorMsg(response.error?.description || "Payment attempt failed.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initialization failed:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to launch payment checkout.");
      setTransactionState("FAILED");
      setLoading(false);
    }
  };

  return (
    <div className="w-100 my-3">
      <div
        className="rounded-4 border overflow-hidden shadow-lg transition-all position-relative"
        style={{
          background: "linear-gradient(145deg, #13141b 0%, #1a1c27 100%)",
          borderColor:
            transactionState === "SUCCESS"
              ? "rgba(25, 135, 84, 0.6)"
              : !isAllowed || transactionState === "BLOCKED"
              ? "rgba(220, 53, 69, 0.6)"
              : "rgba(255, 193, 7, 0.4)",
        }}
      >
        {/* CARD TOP BADGE HEADER */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2.5 bg-black bg-opacity-40 border-bottom border-secondary border-opacity-20 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
              <FaShieldAlt /> Agentic Commerce Proposal
            </span>
            <span className="text-secondary small font-monospace" style={{ fontSize: "11px" }}>
              Razorpay Track 01
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isAllowed || transactionState === "BLOCKED" ? (
              <span className="badge bg-danger text-light font-monospace" style={{ fontSize: "11px" }}>
                ⛔ BLOCKED BY POLICY
              </span>
            ) : transactionState === "SUCCESS" ? (
              <span className="badge bg-success text-light font-monospace" style={{ fontSize: "11px" }}>
                ✓ VERIFIED & PAID
              </span>
            ) : transactionState === "CANCELLED" ? (
              <span className="badge bg-secondary text-light font-monospace" style={{ fontSize: "11px" }}>
                ⚠️ CANCELLED
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-30 font-monospace" style={{ fontSize: "11px" }}>
                ⚡ CONFIRMATION GATED
              </span>
            )}
          </div>
        </div>

        {/* CARD MAIN CONTENT */}
        <div className="p-3.5 p-sm-4">
          
          {/* PACKAGE TITLE & DESTINATION */}
          <div className="d-flex justify-content-between align-items-start gap-2 mb-3 flex-wrap">
            <div>
              <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2" style={{ fontSize: "18px" }}>
                <FaPlane className="text-warning" /> {pkg.packageName || `${pkg.destination} Group Getaway`}
              </h5>
              <p className="text-secondary small mb-0 d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: "12px" }}>
                <span><FaCalendarAlt className="text-warning me-1" /> {pkg.durationDays} Days</span>
                <span><FaUsers className="text-warning me-1" /> {pkg.travelersCount} Travelers</span>
                <span><FaWallet className="text-warning me-1" /> Limit: ₹{pkg.maxBudgetPerPerson?.toLocaleString("en-IN")}/person</span>
              </p>
            </div>
            
            <div className="text-sm-end mt-2 mt-sm-0">
              <span className="text-secondary small d-block" style={{ fontSize: "11px" }}>Calculated Package Total</span>
              <h4 className="fw-bold text-warning mb-0" style={{ fontSize: "22px" }}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </h4>
            </div>
          </div>

          {/* FINANCIAL BUDGET BOUNDARY METER */}
          <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1.5 small" style={{ fontSize: "12px" }}>
              <span className="text-secondary">Configured Group Budget Boundary</span>
              <span className="fw-bold text-light">
                ₹{totalAmount.toLocaleString("en-IN")} / ₹{budgetLimit.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="progress rounded-pill bg-dark" style={{ height: "8px" }}>
              <div
                className={`progress-bar rounded-pill ${
                  !isAllowed ? "bg-danger" : budgetUsedPct > 90 ? "bg-warning" : "bg-success"
                }`}
                role="progressbar"
                style={{ width: `${budgetUsedPct}%`, transition: "width 0.6s ease" }}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2 small" style={{ fontSize: "11px" }}>
              {isAllowed ? (
                <span className="text-success d-flex align-items-center gap-1">
                  <FaCheckCircle /> Saved ₹{remainingBuffer.toLocaleString("en-IN")} buffer remaining
                </span>
              ) : (
                <span className="text-danger d-flex align-items-center gap-1">
                  <FaExclamationTriangle /> Exceeds budget limit by ₹{Math.abs(remainingBuffer).toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-secondary font-monospace">{budgetUsedPct}% Used</span>
            </div>
          </div>

          {/* EXPLAINABILITY LIST ("WHY RECOMMENDED") */}
          <div className="mb-3">
            <h6 className="small text-warning fw-bold mb-2 text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
              💡 AI Decision Explainability
            </h6>
            <div className="d-flex flex-column gap-1.5">
              {pkg.explanation?.map((item, idx) => (
                <div key={idx} className="d-flex align-items-start gap-2 small text-light" style={{ fontSize: "13px" }}>
                  <span className={isAllowed ? "text-success" : "text-danger"}>
                    {isAllowed ? "✓" : "❌"}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE BREAKDOWN TOGGLE / DRAWER */}
          {showDetailsDrawer && pkg.priceBreakdown && (
            <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-20 mb-3 animate-fade-in">
              <h6 className="small text-warning fw-bold mb-2" style={{ fontSize: "12px" }}>
                📊 Itemized Cost Breakdown
              </h6>
              <div className="row g-2 small text-secondary" style={{ fontSize: "12px" }}>
                <div className="col-6">Resort / Hotel Stay: <span className="text-light fw-medium">₹{pkg.priceBreakdown.stay?.toLocaleString("en-IN")}</span></div>
                <div className="col-6">Group Transport: <span className="text-light fw-medium">₹{pkg.priceBreakdown.transport?.toLocaleString("en-IN")}</span></div>
                <div className="col-6">Activities & Passes: <span className="text-light fw-medium">₹{pkg.priceBreakdown.activities?.toLocaleString("en-IN")}</span></div>
                <div className="col-6">Food & Emergency: <span className="text-light fw-medium">₹{pkg.priceBreakdown.foodAndMisc?.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 d-flex justify-content-between align-items-center">
              <span>⚠️ {errorMsg}</span>
              <button className="btn btn-link text-danger p-0 text-decoration-none small fw-bold" onClick={() => setErrorMsg("")}>
                Dismiss
              </button>
            </div>
          )}

          {/* STATE SPECIFIC ACTION BANNERS & GATED BUTTONS */}
          
          {/* STATE: SUCCESS */}
          {transactionState === "SUCCESS" && (
            <div className="p-3 rounded-3 bg-success bg-opacity-15 border border-success border-opacity-40 text-success mb-3 d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: "14px" }}>
                <FaCheckCircle size={18} /> Payment Verified via Razorpay HMAC-SHA256. Trip Confirmed!
              </div>
              <p className="small mb-0 text-light text-opacity-90" style={{ fontSize: "12px" }}>
                Your travel transaction has been verified server-side. The trip has been created and synced with your account ledger.
              </p>
              <div className="d-flex gap-2 mt-1 flex-wrap">
                {confirmedTripId && (
                  <button className="btn btn-success btn-sm fw-bold px-3 text-white" onClick={() => navigate(`/trips/${confirmedTripId}`)}>
                    ✈️ View Confirmed Trip
                  </button>
                )}
                <button className="btn btn-outline-success btn-sm fw-bold px-3" onClick={() => setShowAuditModal(true)}>
                  <FaHistory /> View Audit Trail
                </button>
              </div>
            </div>
          )}

          {/* STATE: CANCELLED */}
          {transactionState === "CANCELLED" && (
            <div className="p-3 rounded-3 bg-warning bg-opacity-15 border border-warning border-opacity-40 text-warning mb-3 d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: "14px" }}>
                <FaExclamationTriangle size={16} /> Payment was not completed. Your trip has not been confirmed.
              </div>
              <p className="small mb-0 text-light text-opacity-80" style={{ fontSize: "12px" }}>
                The payment process was closed before completion. No money was deducted, and no Razorpay order was verified.
              </p>
              <div className="d-flex gap-2 mt-1 flex-wrap">
                <button className="btn btn-warning btn-sm fw-bold px-3 text-dark" onClick={handleProceedToPayment} disabled={loading}>
                  🔄 Retry Payment
                </button>
                <button className="btn btn-outline-warning btn-sm fw-bold px-3" onClick={() => setShowAuditModal(true)}>
                  <FaHistory /> Audit Log
                </button>
              </div>
            </div>
          )}

          {/* STATE: BLOCKED BY POLICY */}
          {(!isAllowed || transactionState === "BLOCKED") && (
            <div className="p-3 rounded-3 bg-danger bg-opacity-15 border border-danger border-opacity-40 text-danger mb-3">
              <div className="d-flex align-items-center gap-2 fw-bold mb-1" style={{ fontSize: "13px" }}>
                <FaExclamationTriangle /> Payment Order Creation Blocked
              </div>
              <p className="small mb-0 text-light text-opacity-90" style={{ fontSize: "12px" }}>
                This option exceeds your configured travel budget (₹{totalAmount.toLocaleString("en-IN")} &gt; ₹{budgetLimit.toLocaleString("en-IN")}). Razorpay payment order was <strong>NOT</strong> created.
              </p>
              <button className="btn btn-outline-danger btn-sm fw-bold px-3 mt-2" onClick={() => setShowAuditModal(true)}>
                <FaHistory /> View Policy Audit
              </button>
            </div>
          )}

          {/* DEFAULT / PROPOSED CONFIRMATION GATE BUTTONS */}
          {transactionState === "PROPOSED" && isAllowed && (
            <div className="d-flex align-items-center justify-content-between gap-2 mt-3 flex-wrap">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm px-3 text-light"
                  onClick={() => setShowDetailsDrawer(!showDetailsDrawer)}
                  style={{ fontSize: "12px" }}
                >
                  <FaInfoCircle className="me-1" /> {showDetailsDrawer ? "Hide Details" : "View Details"}
                </button>

                <button
                  className="btn btn-outline-warning btn-sm px-3"
                  onClick={() => setShowAuditModal(true)}
                  style={{ fontSize: "12px" }}
                >
                  <FaHistory className="me-1" /> Audit Trail
                </button>
              </div>

              {/* CONSEQUENTIAL PAYMENT ACTION BUTTON */}
              <button
                className="btn btn-warning btn-sm fw-bold px-4 py-2 text-dark rounded-3 d-flex align-items-center gap-2 shadow"
                onClick={handleProceedToPayment}
                disabled={loading}
                style={{ fontSize: "13px", transition: "all 0.2s ease" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCreditCard /> Proceed to Payment
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* AUDIT TRAIL MODAL */}
      {showAuditModal && (
        <AuditTrailModal
          transactionId={pkg.transactionId}
          onClose={() => setShowAuditModal(false)}
        />
      )}
    </div>
  );
}

export default AgenticCommerceCard;
