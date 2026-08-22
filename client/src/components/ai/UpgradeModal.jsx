import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCheck, FaStar, FaLock, FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";
import { createPaymentOrder, verifyPayment } from "../../services/aiSubscriptionService";

const AI_TOOLS_OPTIONS = [
  { id: "ai_assistant", name: "AI Assistant (Chat)" },
  { id: "itinerary", name: "AI Itinerary Planner" },
  { id: "packing", name: "AI Packing List" },
  { id: "expenses", name: "AI Expense Insights" },
  { id: "recommendations", name: "AI Recommendation" },
  { id: "planner", name: "AI Travel Planner" },
  { id: "destination", name: "AI Destination Insights" },
  { id: "safety", name: "AI Safety Assistant" },
  { id: "budget", name: "AI Budget Assistant" },
  { id: "trip_assistant", name: "AI Trip Assistant" },
];

export default function UpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  initialPlan = "PRO",
  initialToolId = "ai_assistant",
}) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedToolId, setSelectedToolId] = useState(initialToolId);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(initialPlan || "PRO");
      setSelectedToolId(initialToolId || "ai_assistant");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, initialPlan, initialToolId]);

  if (!isOpen) return null;

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

  const handlePayment = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (selectedPlan === "INDIVIDUAL" && !selectedToolId) {
      setErrorMsg("Please select one AI tool to unlock with the Individual plan.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend (DOES NOT ACTIVATE SUBSCRIPTION)
      const orderRes = await createPaymentOrder(
        selectedPlan,
        selectedPlan === "INDIVIDUAL" ? selectedToolId : null
      );

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Unable to create payment order.");
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 3. Launch Razorpay Checkout Popup
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "TripShare AI",
        description: `${selectedPlan} Plan Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // 4. Send payment credentials to backend for HMAC verification & activation
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "mock_signature",
            });

            if (verifyRes.success) {
              setSuccessMsg("Your subscription has been activated!");
              setTimeout(() => {
                if (onSuccess) onSuccess(verifyRes.subscription);
                onClose();
              }, 1500);
            } else {
              setErrorMsg(verifyRes.message || "Payment verification failed. Subscription was not activated.");
            }
          } catch (err) {
            console.error(err);
            setErrorMsg("Payment verification failed. Your subscription was not activated.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMsg("Payment was cancelled or closed. Subscription remains unchanged.");
          },
        },
        theme: {
          color: "#ffd700",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setErrorMsg(response.error?.description || "Payment was cancelled or failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unable to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const handleNavigateToHub = () => {
    onClose();
    navigate("/ai/subscription");
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
      style={{
        zIndex: 1050,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="glass-card w-100 p-4 p-md-5 overflow-auto text-light border border-secondary border-opacity-20 rounded-4"
        style={{
          maxWidth: "920px",
          maxHeight: "90vh",
          backgroundColor: "#16181d",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge rounded-pill bg-warning bg-opacity-20 text-warning px-3 py-1 fw-semibold">
                TRIPSHARE AI PRO
              </span>
              <button
                onClick={handleNavigateToHub}
                className="btn btn-link text-warning p-0 extra-small fw-semibold text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: "0.8rem" }}
              >
                View AI Subscription <FaExternalLinkAlt size={10} />
              </button>
            </div>
            <h2 className="fw-bold mb-1 text-white">Upgrade Your AI Experience</h2>
            <p className="text-secondary small mb-0">
              Unlock higher limits & exclusive travel intelligence
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-2"
            style={{ width: "40px", height: "40px" }}
          >
            <FaTimes />
          </button>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger rounded-3 py-2 px-3 mb-4 small">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-20 text-success rounded-3 py-2 px-3 mb-4 small d-flex align-items-center gap-2">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        {/* PRICING CARDS ROW */}
        <div className="row g-3 mb-4">
          {/* INDIVIDUAL */}
          <div className="col-12 col-md-4">
            <div
              onClick={() => setSelectedPlan("INDIVIDUAL")}
              className={`p-3 p-md-4 rounded-4 h-100 d-flex flex-column justify-content-between position-relative cursor-pointer transition-all ${
                selectedPlan === "INDIVIDUAL" ? "border-warning bg-dark" : "border-secondary bg-dark bg-opacity-50"
              }`}
              style={{
                border: selectedPlan === "INDIVIDUAL" ? "2px solid #ffd700" : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: selectedPlan === "INDIVIDUAL" ? "rgba(25, 27, 33, 0.9)" : "rgba(20, 22, 26, 0.6)",
              }}
            >
              <div>
                <span className="text-secondary small fw-bold uppercase">INDIVIDUAL</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h3 className="fw-bold text-white mb-0">₹9</h3>
                  <span className="text-secondary small">/ month</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ONE selected AI tool with 200 requests/month.
                </p>

                {/* TOOL SELECTOR DROPDOWN */}
                {selectedPlan === "INDIVIDUAL" && (
                  <div className="mt-3 mb-3">
                    <label className="form-label text-warning small fw-semibold">
                      Select Tool to Unlock:
                    </label>
                    <select
                      value={selectedToolId}
                      onChange={(e) => setSelectedToolId(e.target.value)}
                      className="form-select form-select-sm bg-dark text-white border-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {AI_TOOLS_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="small text-secondary mt-2">
                <FaCheck className="text-warning me-2" /> 200 req/mo for 1 tool
              </div>
            </div>
          </div>

          {/* COMBO */}
          <div className="col-12 col-md-4">
            <div
              onClick={() => setSelectedPlan("COMBO")}
              className={`p-3 p-md-4 rounded-4 h-100 d-flex flex-column justify-content-between position-relative cursor-pointer transition-all ${
                selectedPlan === "COMBO" ? "border-warning bg-dark" : "border-secondary bg-dark bg-opacity-50"
              }`}
              style={{
                border: selectedPlan === "COMBO" ? "2px solid #ffd700" : "1px solid rgba(255,255,255,0.1)",
                backgroundColor: selectedPlan === "COMBO" ? "rgba(25, 27, 33, 0.9)" : "rgba(20, 22, 26, 0.6)",
              }}
            >
              <div>
                <span className="text-secondary small fw-bold uppercase">AI COMBO</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h3 className="fw-bold text-white mb-0">₹99</h3>
                  <span className="text-secondary small">/ 3 months</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ALL 10 AI tools with 300 requests/month each.
                </p>
              </div>
              <div className="small text-secondary mt-2">
                <FaCheck className="text-warning me-2" /> 10 Tools (300 req/mo each)
              </div>
            </div>
          </div>

          {/* PRO */}
          <div className="col-12 col-md-4">
            <div
              onClick={() => setSelectedPlan("PRO")}
              className={`p-3 p-md-4 rounded-4 h-100 d-flex flex-column justify-content-between position-relative cursor-pointer transition-all ${
                selectedPlan === "PRO" ? "border-warning" : "border-secondary"
              }`}
              style={{
                border: "2px solid #ffd700",
                background: "linear-gradient(145deg, rgba(35, 30, 20, 0.9) 0%, rgba(20, 22, 26, 0.95) 100%)",
                boxShadow: selectedPlan === "PRO" ? "0 0 20px rgba(255, 215, 0, 0.2)" : "none",
              }}
            >
              <div className="position-absolute top-0 end-0 translate-middle-y me-3">
                <span className="badge bg-warning text-dark font-weight-bold px-2 py-1 shadow-sm" style={{ fontSize: "0.7rem" }}>
                  <FaStar className="me-1" /> BEST VALUE ⭐
                </span>
              </div>
              <div>
                <span className="text-warning small fw-bold uppercase">AI PRO ANNUAL</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h3 className="fw-bold text-warning mb-0">₹299</h3>
                  <span className="text-secondary small">/ year</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ALL 10 AI tools with 500 requests/month each.
                </p>
              </div>
              <div className="small text-warning mt-2">
                <FaCheck className="text-warning me-2" /> 10 Tools (500 req/mo each)
              </div>
            </div>
          </div>
        </div>

        {/* BENEFITS LIST */}
        <div className="row g-2 mb-4 p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-10 small text-secondary">
          <div className="col-12 col-sm-6"><FaCheck className="text-warning me-2" /> 10 Powerful AI Tools</div>
          <div className="col-12 col-sm-6"><FaCheck className="text-warning me-2" /> Higher Usage Limits</div>
          <div className="col-12 col-sm-6"><FaCheck className="text-warning me-2" /> Razorpay HMAC Security</div>
          <div className="col-12 col-sm-6"><FaCheck className="text-warning me-2" /> Auto Monthly Reset</div>
        </div>

        {/* FOOTER CTA */}
        <div className="d-flex flex-column flex-sm-row gap-3 align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-20">
          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary small">
              <FaLock className="me-1 text-warning" /> Secured by Razorpay Payment Gateway
            </span>
            <button
              onClick={handleNavigateToHub}
              className="btn btn-link text-warning p-0 extra-small fw-semibold text-decoration-none"
              style={{ fontSize: "0.8rem" }}
            >
              Manage AI Subscription →
            </button>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-warning fw-bold px-4 py-2 text-dark rounded-pill d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
            style={{ minWidth: "200px" }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Processing...
              </>
            ) : (
              `Pay with Razorpay`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
