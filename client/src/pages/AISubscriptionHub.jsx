import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaCheck, FaStar, FaShieldAlt, FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import { getSubscriptionStatus } from "../services/aiSubscriptionService";
import UpgradeModal from "../components/ai/UpgradeModal";

const AI_TOOLS_MAP = {
  ai_assistant: "AI Assistant",
  itinerary: "AI Itinerary",
  packing: "AI Packing List",
  expenses: "AI Expense Insights",
  recommendations: "AI Recommendation",
  planner: "AI Travel Planner",
  destination: "AI Destination Insights",
  safety: "AI Safety Assistant",
  budget: "AI Budget Assistant",
  trip_assistant: "AI Trip Assistant",
};

const DEFAULT_FREE_TOOLS = [
  { id: "ai_assistant", name: "AI Assistant", icon: "🤖", description: "Your 24/7 personal travel companion & chat assistant", limit: 15, consumed: 0, remaining: 15, isFreeLimit: true },
  { id: "itinerary", name: "AI Itinerary", icon: "🗺️", description: "Custom day-wise itinerary planner", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "packing", name: "AI Packing List", icon: "🧳", description: "Smart contextual packing list generator", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "expenses", name: "AI Expense Insights", icon: "💡", description: "Intelligent trip budget & spending insights", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "recommendations", name: "AI Recommendation", icon: "✨", description: "Personalized travel & destination suggestions", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "planner", name: "AI Travel Planner", icon: "📅", description: "End-to-end trip planning assistant", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "destination", name: "AI Destination Insights", icon: "🏛️", description: "Deep cultural & destination guide", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "safety", name: "AI Safety Assistant", icon: "🛡️", description: "Real-time safety, emergency & local advice", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "budget", name: "AI Budget Assistant", icon: "💰", description: "Expense forecasting & cost saving expert", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
  { id: "trip_assistant", name: "AI Trip Assistant", icon: "🧭", description: "Real-time on-trip navigator & helper", limit: 5, consumed: 0, remaining: 5, isFreeLimit: true },
];

export default function AISubscriptionHub() {
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState("PRO");
  const [selectedToolForUpgrade, setSelectedToolForUpgrade] = useState("ai_assistant");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSubscriptionStatus();
      if (res.success && res.data) {
        setSubscriptionData(res.data);
      } else {
        setError(res.message || "Unable to load subscription details.");
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
      setError("Unable to load subscription details. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpgrade = (plan = "PRO", toolId = "ai_assistant") => {
    setSelectedPlanForModal(plan);
    setSelectedToolForUpgrade(toolId);
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" style={{ width: "3rem", height: "3rem" }} />
          <h5>Loading AI Subscription Hub...</h5>
        </div>
      </div>
    );
  }

  // Real backend subscription state extraction
  const rawPlan = subscriptionData?.plan || "FREE";
  const rawStatus = subscriptionData?.status || "ACTIVE";
  const rawEndDate = subscriptionData?.endDate ? new Date(subscriptionData.endDate) : null;
  const isExpired = rawStatus === "EXPIRED" || (rawEndDate && new Date() > rawEndDate);

  const plan = isExpired ? "FREE" : rawPlan;
  const statusDisplay = isExpired ? "EXPIRED / FREE" : rawStatus;
  const purchasedToolId = subscriptionData?.purchasedToolId || null;
  const purchasedToolName = purchasedToolId ? AI_TOOLS_MAP[purchasedToolId] || purchasedToolId : null;

  const tools = (subscriptionData?.tools && subscriptionData.tools.length > 0)
    ? subscriptionData.tools
    : DEFAULT_FREE_TOOLS;

  return (
    <div className="dashboard-page min-vh-100 text-light py-5">
      <div className="container py-4">
        {/* TOP BAR */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary btn-sm rounded-pill text-light d-flex align-items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={fetchStatus}
            className="btn btn-outline-warning btn-sm rounded-pill d-flex align-items-center gap-2"
          >
            <FaSyncAlt /> Refresh Usage
          </button>
        </div>

        {/* HERO HEADER & REAL CURRENT PLAN STATUS */}
        <div
          className="glass-card p-4 p-md-5 mb-5 rounded-4 border border-secondary border-opacity-20 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(25, 27, 33, 0.9) 0%, rgba(35, 30, 20, 0.8) 100%)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span className="badge rounded-pill bg-warning text-dark font-weight-bold px-3 py-1 mb-2">
                <FaCrown className="me-1" /> TRIPSHARE AI SUBSCRIPTION
              </span>
              <h1 className="fw-bold text-white mb-2">TripShare AI Pro</h1>
              <p className="text-secondary mb-0" style={{ maxWidth: "600px" }}>
                Supercharge your travel planning with 10 specialized AI travel tools, server-backed entitlement, and Razorpay security.
              </p>
            </div>

            {/* REAL CURRENT PLAN CARD */}
            <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-warning border-opacity-30 text-end">
              <span className="text-secondary small d-block">Current Plan</span>
              <h4 className="fw-bold text-warning mb-1">
                {plan === "FREE"
                  ? "FREE PLAN"
                  : plan === "INDIVIDUAL"
                  ? "INDIVIDUAL PLAN"
                  : plan === "COMBO"
                  ? "AI COMBO"
                  : "AI PRO ANNUAL"}
              </h4>
              <span
                className={`badge rounded-pill ${
                  statusDisplay === "ACTIVE" && plan !== "FREE" ? "bg-success" : "bg-secondary"
                }`}
              >
                {statusDisplay}
              </span>
              {plan === "INDIVIDUAL" && purchasedToolName && (
                <div className="text-warning extra-small mt-1 fw-semibold">
                  Selected Tool: {purchasedToolName}
                </div>
              )}
              {plan !== "FREE" && rawEndDate && !isExpired && (
                <div className="text-secondary extra-small mt-1">
                  Expires: {rawEndDate.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ERROR STATE WITH RETRY BUTTON */}
        {error && (
          <div className="alert alert-warning bg-warning bg-opacity-10 border-warning border-opacity-30 text-warning rounded-4 p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>Unable to load subscription details.</strong> {error}
            </div>
            <button
              onClick={fetchStatus}
              className="btn btn-warning btn-sm fw-bold text-dark rounded-pill px-3"
            >
              <FaSyncAlt className="me-1" /> Retry
            </button>
          </div>
        )}

        {/* SECTION 1: SUBSCRIPTION PLANS */}
        <h3 className="fw-bold text-white mb-2">Subscription Plans</h3>
        <p className="text-secondary small mb-4">Choose the plan that fits your travel requirements best.</p>

        <div className="row g-4 mb-5">
          {/* INDIVIDUAL */}
          <div className="col-12 col-md-4">
            <div className="p-4 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-20 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-secondary small fw-bold uppercase">INDIVIDUAL TOOL</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h2 className="fw-bold text-white mb-0">₹9</h2>
                  <span className="text-secondary small">/ month</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ONE selected AI tool with 200 requests/month. Other tools retain their normal free allowance.
                </p>
                <div className="small text-warning mb-4">
                  <FaCheck className="me-1" /> 200 requests/month for 1 tool
                </div>
              </div>
              <button
                onClick={() => handleOpenUpgrade("INDIVIDUAL", "ai_assistant")}
                className="btn btn-outline-warning w-100 rounded-pill fw-bold"
              >
                Select Tool & Pay ₹9
              </button>
            </div>
          </div>

          {/* COMBO */}
          <div className="col-12 col-md-4">
            <div className="p-4 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-20 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-secondary small fw-bold uppercase">AI COMBO</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h2 className="fw-bold text-white mb-0">₹99</h2>
                  <span className="text-secondary small">/ 3 months</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ALL 10 AI tools. Each tool receives 300 requests/month.
                </p>
                <div className="small text-warning mb-4">
                  <FaCheck className="me-1" /> 300 requests/month PER TOOL
                </div>
              </div>
              <button
                onClick={() => handleOpenUpgrade("COMBO")}
                className="btn btn-outline-warning w-100 rounded-pill fw-bold"
              >
                Get AI Combo ₹99
              </button>
            </div>
          </div>

          {/* PRO */}
          <div className="col-12 col-md-4">
            <div
              className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between position-relative"
              style={{
                border: "2px solid #ffd700",
                background: "linear-gradient(145deg, rgba(35, 30, 20, 0.9) 0%, rgba(20, 22, 26, 0.95) 100%)",
                boxShadow: "0 10px 30px rgba(255, 215, 0, 0.15)",
              }}
            >
              <div className="position-absolute top-0 end-0 translate-middle-y me-3">
                <span className="badge bg-warning text-dark font-weight-bold px-3 py-1 shadow">
                  <FaStar className="me-1" /> BEST VALUE ⭐
                </span>
              </div>
              <div>
                <span className="text-warning small fw-bold uppercase">AI PRO ANNUAL</span>
                <div className="d-flex align-items-baseline gap-1 my-2">
                  <h2 className="fw-bold text-warning mb-0">₹299</h2>
                  <span className="text-secondary small">/ year</span>
                </div>
                <p className="text-secondary small mb-3">
                  Unlock ALL 10 AI tools with 500 requests/month each for an entire year. Maximum value.
                </p>
                <div className="small text-warning mb-4">
                  <FaCheck className="me-1" /> 500 requests/month PER TOOL
                </div>
              </div>
              <button
                onClick={() => handleOpenUpgrade("PRO")}
                className="btn btn-warning w-100 rounded-pill fw-bold text-dark"
              >
                Get AI Pro Annual ₹299
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: AI TOOLS & USAGE LIMITS */}
        <h3 className="fw-bold text-white mb-2 d-flex align-items-center gap-2">
          <span>⚡ AI Tools & Usage</span>
        </h3>
        <p className="text-secondary small mb-4">
          Monitor your real-time server-side request usage and remaining quota for each tool.
        </p>

        <div className="row g-3 mb-5">
          {tools.map((tool) => {
            const limit = tool.limit || 5;
            const consumed = tool.consumed || 0;
            const remaining = tool.remaining !== undefined ? tool.remaining : Math.max(0, limit - consumed);
            const pct = limit > 0 ? Math.min(100, Math.round((consumed / limit) * 100)) : 0;
            const isExhausted = remaining <= 0;

            return (
              <div key={tool.id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-20 h-100 d-flex flex-column justify-content-between"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-4">{tool.icon}</span>
                        <h6 className="fw-bold text-white mb-0">{tool.name}</h6>
                      </div>
                      <span
                        className={`badge rounded-pill ${
                          tool.isFreeLimit ? "bg-secondary bg-opacity-40 text-light" : "bg-warning text-dark font-weight-bold"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {tool.isFreeLimit ? "Free Limit" : "Pro"}
                      </span>
                    </div>

                    <p className="text-secondary extra-small mb-3" style={{ minHeight: "32px", fontSize: "0.78rem" }}>
                      {tool.description}
                    </p>

                    {/* PROGRESS BAR & CLEAR UNAMBIGUOUS USAGE DISPLAY */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-secondary mb-1">
                        <span>Used: {consumed} / {limit}</span>
                        <span className={isExhausted ? "text-danger fw-bold" : "text-warning"}>
                          {remaining} remaining
                        </span>
                      </div>
                      <div className="progress bg-secondary bg-opacity-20" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar ${isExhausted ? "bg-danger" : "bg-warning"}`}
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenUpgrade(tool.isFreeLimit ? "INDIVIDUAL" : "PRO", tool.id)}
                    className={`btn btn-sm rounded-pill mt-3 w-100 ${
                      isExhausted ? "btn-warning text-dark fw-bold" : "btn-outline-secondary text-light"
                    }`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {isExhausted ? "Limit Reached - Upgrade" : "Upgrade Tool Limit"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 3: SUBSCRIPTION BENEFITS */}
        <div className="glass-card p-4 rounded-4 border border-secondary border-opacity-20">
          <h4 className="fw-bold text-white mb-3">Subscription Benefits</h4>
          <div className="row g-3">
            <div className="col-12 col-sm-6 d-flex align-items-center gap-2 text-secondary">
              <FaCheck className="text-warning" /> 10 Specialized AI Travel Tools
            </div>
            <div className="col-12 col-sm-6 d-flex align-items-center gap-2 text-secondary">
              <FaCheck className="text-warning" /> Higher Usage Limits Up to 500/mo
            </div>
            <div className="col-12 col-sm-6 d-flex align-items-center gap-2 text-secondary">
              <FaShieldAlt className="text-warning" /> Razorpay HMAC Security Verification
            </div>
            <div className="col-12 col-sm-6 d-flex align-items-center gap-2 text-secondary">
              <FaCheck className="text-warning" /> Auto Server-Side Monthly Usage Reset
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => fetchStatus()}
        initialPlan={selectedPlanForModal}
        initialToolId={selectedToolForUpgrade}
      />
    </div>
  );
}
