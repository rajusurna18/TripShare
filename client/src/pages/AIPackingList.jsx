import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaPrint, FaCopy, FaUndo, FaPlus, FaCheck, FaTimes } from "react-icons/fa";

function AIPackingList() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Input states
  const [weather, setWeather] = useState("Moderate");
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState("Budget");
  const [activitiesInput, setActivitiesInput] = useState("");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchTripAndList();
  }, [tripId]);

  async function fetchTripAndList() {
    try {
      setLoading(true);
      setError("");

      // Fetch Trip Details
      const tripRes = await API.get(`/trips/${tripId}`);
      if (tripRes.data.success) {
        const tripData = tripRes.data.trip;
        setTrip(tripData);
        setDuration(calculateDays(tripData.startDate, tripData.endDate) || 3);
        setBudget(tripData.budget > 50000 ? "Luxury" : "Budget");
        if (tripData.tags) {
          setActivities(tripData.tags);
          setActivitiesInput(tripData.tags.join(", "));
        }
      }

      // Fetch Saved Packing List
      const listRes = await API.get(`/ai/packing/${tripId}`);
      if (listRes.data.success && listRes.data.packingList) {
        setPackingList(listRes.data.packingList);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to initialize packing page. Ensure you are a member.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");

      const parsedActivities = activitiesInput
        .split(",")
        .map(a => a.trim())
        .filter(Boolean);

      const res = await API.post(`/ai/packing/${tripId}/generate`, {
        weather,
        duration: Number(duration),
        budget,
        activities: parsedActivities.length > 0 ? parsedActivities : activities
      });

      if (res.data.success) {
        setPackingList(res.data.packingList);
      }
    } catch (err) {
      console.error(err);
      setError("AI generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (categoryName, itemId) => {
    try {
      // Optimistic update
      setPackingList(prev => {
        if (!prev) return null;
        return {
          ...prev,
          categories: prev.categories.map(cat => {
            if (cat.name !== categoryName) return cat;
            return {
              ...cat,
              items: cat.items.map(item => {
                if (item._id !== itemId) return item;
                return { ...item, checked: !item.checked };
              })
            };
          })
        };
      });

      await API.put(`/ai/packing/${tripId}/toggle`, {
        categoryName,
        itemId
      });
    } catch (err) {
      console.error("Toggle item check failed:", err);
      // Revert state if failed (re-fetch)
      fetchTripAndList();
    }
  };

  const handleCopyList = () => {
    if (!packingList) return;
    let listText = `TripShare AI Packing List for ${trip?.destination || "Trip"}\n\n`;
    packingList.categories.forEach(cat => {
      listText += `--- ${cat.name} ---\n`;
      cat.items.forEach(item => {
        listText += `[${item.checked ? "x" : " "}] ${item.name}\n`;
      });
      listText += "\n";
    });
    navigator.clipboard.writeText(listText);
    alert("Checked items list copied to clipboard! 📋");
  };

  const handlePrint = () => {
    window.print();
  };

  // Progress metrics
  const getProgressDetails = () => {
    if (!packingList) return { total: 0, checked: 0, pct: 0 };
    let total = 0;
    let checked = 0;
    packingList.categories.forEach(c => {
      c.items.forEach(i => {
        total++;
        if (i.checked) checked++;
      });
    });
    return {
      total,
      checked,
      pct: total > 0 ? Math.round((checked / total) * 100) : 0
    };
  };

  const stats = getProgressDetails();

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" />
          <h4>Preparing Packing Desk...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-vh-100 text-light py-5">
      <div className="container container-responsive" style={{ maxWidth: "1200px" }}>
        
        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5 no-print">
          <div>
            <h1 className="fw-bold display-6">🎒 AI Packing Planner</h1>
            <p className="text-secondary mb-0">Customized packing checkers fueled by Gemini AI</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm btn-responsive rounded-3 px-3" onClick={() => navigate(-1)}>
            ◀ Back to Trip
          </button>
        </div>

        {error && (
          <div className="alert alert-warning py-3 px-4 mb-4 rounded-4 border-0 shadow-sm no-print">
            ⚠️ {error}
          </div>
        )}

        <div className="row g-4">
          
          {/* INPUT FORM PANEL */}
          <div className="col-12 col-lg-4 no-print">
            <div className="glass-card p-4">
              <h4 className="fw-bold text-warning mb-4">Trip Configurations</h4>
              
              <div className="mb-3">
                <label className="form-label small fw-bold">Destination</label>
                <input type="text" className="form-control bg-dark border-secondary border-opacity-35 text-light" value={trip?.destination || ""} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Expected Weather</label>
                <select className="form-select bg-dark border-secondary border-opacity-35 text-light" value={weather} onChange={(e) => setWeather(e.target.value)}>
                  <option value="Moderate">Moderate / Mild</option>
                  <option value="Hot">Hot / Sunny</option>
                  <option value="Cold">Cold / Snowing</option>
                  <option value="Rainy">Wet / Rainy</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Duration (Days)</label>
                <input type="number" className="form-control bg-dark border-secondary border-opacity-35 text-light" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min="1" />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Budget Tier</label>
                <select className="form-select bg-dark border-secondary border-opacity-35 text-light" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="Budget">Budget Option</option>
                  <option value="Luxury">Luxury Style</option>
                  <option value="Mid-range">Mid-range Style</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Activities (comma-separated)</label>
                <input type="text" className="form-control bg-dark border-secondary border-opacity-35 text-light" value={activitiesInput} onChange={(e) => setActivitiesInput(e.target.value)} placeholder="Trekking, Swimming, Parties" />
              </div>

              <button className="btn btn-warning w-100 py-3 rounded-4 fw-bold shadow" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating Checklist...
                  </>
                ) : (
                  "Generate AI Checklist 🚀"
                )}
              </button>
            </div>
          </div>

          {/* CHECKLIST & CATEGORIES VIEW PANEL */}
          <div className="col-12 col-lg-8">
            {!packingList ? (
              <div className="glass-card p-5 text-center my-auto d-flex flex-column align-items-center justify-content-center min-vh-50 no-print">
                <h3 className="text-warning mb-3">Checklist Pending 🎒</h3>
                <p className="text-secondary max-w-lg mb-4">Set your travel parameters on the left and tap generate to build your customized packing checklist.</p>
                <button className="btn btn-warning px-4 py-2.5 rounded-4 shadow-sm" onClick={handleGenerate} disabled={generating}>
                  Generate List Now
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                
                {/* PROGRESS METRICS CARD */}
                <div className="glass-card p-4 shadow-sm print-border">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Packing Progress</h5>
                    <span className="text-warning fw-bold">{stats.checked} / {stats.total} Packed ({stats.pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: "10px", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${stats.pct}%` }}></div>
                  </div>

                  {/* PRINT ACTIONS BUTTONS */}
                  <div className="d-flex flex-wrap gap-3 justify-content-end mt-3 no-print">
                    <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2" onClick={handleCopyList}>
                      <FaCopy /> Copy List
                    </button>
                    <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2" onClick={handlePrint}>
                      <FaPrint /> Print / Export PDF
                    </button>
                  </div>
                </div>

                {/* CATEGORIES COLLAPSIBLE VIEW */}
                <div className="row g-4">
                  {packingList.categories.map((cat, cIdx) => (
                    <div className="col-12 col-md-6 print-w-100" key={cIdx}>
                      <div className="glass-card p-4 h-100 print-card">
                        <h5 className="fw-bold text-warning border-bottom pb-2 border-secondary border-opacity-20 mb-3">{cat.name}</h5>
                        <div className="d-flex flex-column gap-2">
                          {cat.items.map((item, iIdx) => (
                            <label className="d-flex align-items-start gap-3 cursor-pointer check-row py-1 px-2 rounded-3" key={item._id || iIdx} style={{ cursor: "pointer" }}>
                              <input type="checkbox" className="form-check-input mt-1 border-secondary" checked={item.checked} onChange={() => handleToggle(cat.name, item._id)} />
                              <span className={`small ${item.checked ? "text-muted text-decoration-line-through" : "text-light"}`}>
                                {item.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI RECOMMENDATIONS & ADVICE PANELS */}
                <div className="glass-card p-4 mt-2 print-hide">
                  <h4 className="fw-bold text-warning mb-4">AI Smart Travel Advice</h4>
                  
                  {packingList.weatherAlerts?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-light d-flex align-items-center gap-2">☔ Weather Alerts</h6>
                      <ul className="small text-secondary ps-4">
                        {packingList.weatherAlerts.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}

                  {packingList.safetyTips?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-light d-flex align-items-center gap-2">🛡️ Safety Tips</h6>
                      <ul className="small text-secondary ps-4">
                        {packingList.safetyTips.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}

                  {packingList.healthTips?.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-light d-flex align-items-center gap-2">🩹 Health Recommendations</h6>
                      <ul className="small text-secondary ps-4">
                        {packingList.healthTips.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}

                  {packingList.thingsToAvoid?.length > 0 && (
                    <div>
                      <h6 className="fw-bold text-danger d-flex align-items-center gap-2">🚫 Things to Avoid Carrying</h6>
                      <ul className="small text-secondary ps-4">
                        {packingList.thingsToAvoid.map((t, idx) => <li key={idx}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .check-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        @media print {
          .no-print, .navbar, footer, .print-hide {
            display: none !important;
          }
          body, .dashboard-page {
            background: white !important;
            color: black !important;
          }
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: black !important;
          }
          .text-light {
            color: black !important;
          }
          .text-warning {
            color: #d97706 !important;
          }
          .progress {
            border: 1px solid #ccc;
          }
          .print-w-100 {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          .print-border {
            border-bottom: 2px solid #333 !important;
            padding-bottom: 20px !important;
          }
          .print-card {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default AIPackingList;
