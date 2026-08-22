import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import UpgradeModal from "../components/ai/UpgradeModal";
import AIUsageBadge from "../components/ai/AIUsageBadge";
import { getSubscriptionStatus } from "../services/aiSubscriptionService";

function Itinerary() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("");
  const [tripType, setTripType] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toolSummary, setToolSummary] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await getSubscriptionStatus();
      if (res.success && res.data && res.data.tools) {
        const itinTool = res.data.tools.find((t) => t.id === "itinerary");
        if (itinTool) {
          setToolSummary({
            limit: itinTool.limit,
            consumed: itinTool.consumed,
            remaining: itinTool.remaining,
            isFreeLimit: itinTool.isFreeLimit,
            plan: res.data.plan,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generatePlan = async () => {
    if (!destination || !budget || !days) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const res = await API.post("/ai/itinerary", {
        destination,
        budget,
        days,
        travelers,
        tripType,
      });

      setResult(res.data.itinerary);
      fetchUsage();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 && err.response?.data?.code === "USAGE_LIMIT_EXCEEDED") {
        setShowUpgradeModal(true);
      } else {
        alert(err.response?.data?.message || "Failed to generate itinerary. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <div className="container container-responsive py-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <button className="btn btn-outline-light btn-sm btn-responsive" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <AIUsageBadge
            toolSummary={toolSummary}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </div>

        {/* HERO */}
        <div className="text-center mb-5">
          <h1 className="fw-bold text-warning mb-2">🤖 AI Trip Planner</h1>
          <p className="text-secondary" style={{ maxWidth: "600px", margin: "0 auto" }}>
            Generate a personalized day-wise itinerary powered by TripShare AI.
          </p>
        </div>

        {/* FORM */}
        <div
          className="glass-card p-4 p-md-5 mb-5 mx-auto rounded-4"
          style={{ maxWidth: "700px", background: "rgba(25, 25, 25, 0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Destination *</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. Paris, Goa, Tokyo"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Budget (₹) *</label>
              <input
                type="number"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. 15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-secondary small fw-semibold">Days *</label>
              <input
                type="number"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. 5"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-secondary small fw-semibold">Travelers</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="e.g. 2 adults"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-secondary small fw-semibold">Trip Type</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Solo">Solo</option>
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
                <option value="Couples">Couples</option>
                <option value="Adventure">Adventure</option>
                <option value="Relaxation">Relaxation</option>
              </select>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="btn btn-warning w-100 fw-bold mt-4 py-3 rounded-pill text-dark"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Generating Itinerary...
              </>
            ) : (
              "✨ Generate AI Itinerary"
            )}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div
            className="glass-card p-4 p-md-5 rounded-4 mx-auto"
            style={{ maxWidth: "800px", background: "rgba(20, 22, 26, 0.8)", border: "1px solid rgba(255,215,0,0.2)" }}
          >
            <h3 className="fw-bold text-warning mb-4">Your Custom Itinerary</h3>
            <div
              className="text-light"
              style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "15px" }}
            >
              {result}
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => fetchUsage()}
        initialToolId="itinerary"
      />
    </div>
  );
}

export default Itinerary;