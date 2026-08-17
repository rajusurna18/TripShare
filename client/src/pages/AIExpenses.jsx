import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaMoneyBillWave, FaShieldAlt, FaLightbulb, FaArrowLeft, FaChartPie, FaExclamationTriangle } from "react-icons/fa";

function AIExpenses() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAIInsights();
  }, [tripId]);

  async function fetchAIInsights() {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/expenses/ai/${tripId}/insights`);
      if (res.data.success) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to compile AI insights. Verify trip participation.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" />
          <h4>AI is audit analyzing your expenses ledger...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-vh-100 text-light py-5">
      <div className="container container-responsive" style={{ maxWidth: "1200px" }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold display-6">🤖 AI Expense Advisor</h1>
            <p className="text-secondary mb-0">Smart settlements, anomaly scanning, and budget tips</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm btn-responsive rounded-3 px-3" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Back
          </button>
        </div>

        {error && (
          <div className="alert alert-warning border-0 rounded-4 px-4 py-3 mb-4 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* SETTLEMENT SUMMARY */}
        {insights?.balancesData && (
          <div className="glass-card p-4 mb-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 shadow-sm">
            <h4 className="fw-bold text-warning mb-4">Settlement Summary 📊</h4>
            <div className="row text-center g-3">
              <div className="col-6 col-md-3 border-end border-secondary border-opacity-15">
                <h3 className="text-light fw-bold mb-1">₹{insights.balancesData.total || 0}</h3>
                <small className="text-secondary d-block">Total Expenses</small>
              </div>
              <div className="col-6 col-md-3 border-end border-secondary border-opacity-15">
                <h3 className="text-success fw-bold mb-1">₹{insights.balancesData.perPerson || 0}</h3>
                <small className="text-secondary d-block">Per Person Share</small>
              </div>
              <div className="col-6 col-md-3 border-end border-secondary border-opacity-15">
                <h3 className="text-info fw-bold mb-1">₹{insights.simplifiedTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0}</h3>
                <small className="text-secondary d-block">Total Settled</small>
              </div>
              <div className="col-6 col-md-3">
                <h3 className="text-warning fw-bold mb-1">{insights.simplifiedTransactions?.length || 0}</h3>
                <small className="text-secondary d-block">Transfers Required</small>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          
          {/* LEFT: SETTLEMENT PLAN & ANOMALIES */}
          <div className="col-12 col-lg-7">
            
            {/* MINIMIZED SETTLEMENT PATH CARD */}
            <div className="glass-card p-4 mb-4">
              <h4 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2">
                <FaMoneyBillWave /> Optimized Settlement Plan
              </h4>
              <p className="text-secondary small mb-4">
                This transaction sequence settles all debts across the group in the minimum number of transactions possible.
              </p>

              {insights?.simplifiedTransactions?.length === 0 ? (
                <div className="bg-dark bg-opacity-30 border border-success border-opacity-15 p-4 rounded-4 text-center">
                  <h5 className="text-success fw-semibold mb-1">All Settled! 🎉</h5>
                  <p className="text-muted small mb-0">No outstanding debts exist among travelers.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mb-4">
                  {insights?.simplifiedTransactions?.map((tx, idx) => (
                    <div key={idx} className="bg-dark bg-opacity-40 p-3 rounded-4 border border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold text-light">{tx.from}</span>
                        <span className="text-muted small mx-2">pays</span>
                        <span className="fw-bold text-warning">{tx.to}</span>
                      </div>
                      <strong className="text-success h5 mb-0">₹{tx.amount}</strong>
                    </div>
                  ))}
                </div>
              )}

              <h5 className="fw-bold text-light border-top pt-4 border-secondary border-opacity-10 mb-3" style={{ fontSize: "15px" }}>Individual Net Balances</h5>
              <div className="d-flex flex-column gap-2 mb-4">
                {insights?.balancesData?.balances?.map((b, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center py-2 px-3 bg-dark bg-opacity-20 rounded-3" style={{ border: "1px solid rgba(255,255,255,0.02)" }}>
                    <span className="small text-secondary">{b.user} (Paid: ₹{b.paid})</span>
                    <strong className={b.balance > 0 ? "text-success small" : b.balance < 0 ? "text-danger small" : "text-secondary small"}>
                      {b.balance > 0 ? `Gets back ₹${b.balance}` : b.balance < 0 ? `Owes ₹${Math.abs(b.balance)}` : "Settled"}
                    </strong>
                  </div>
                ))}
              </div>

              {insights?.narrative && (
                <div className="bg-dark bg-opacity-20 p-3 rounded-4 border border-secondary border-opacity-5">
                  <span className="badge bg-warning text-dark mb-2">AI Explanation</span>
                  <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>{insights.narrative}</p>
                </div>
              )}
            </div>

            {/* FRAUD & ANOMALIES HIGHLIGHTS */}
            <div className="glass-card p-4">
              <h4 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                <FaShieldAlt /> Anomaly & Fraud Scan
              </h4>
              
              {insights?.anomalies?.length > 0 ? (
                <div className="d-flex flex-column gap-3 mb-3">
                  {insights.anomalies.map((anom, idx) => (
                    <div key={idx} className="bg-danger bg-opacity-10 border border-danger border-opacity-20 p-3 rounded-4 d-flex gap-3">
                      <FaExclamationTriangle className="text-danger mt-1" size={18} />
                      <div>
                        <strong className="text-danger small d-block mb-0.5">{anom.type === "Duplicate" ? "Duplicate Transaction Match" : "Budget Spike Warning"}</strong>
                        <p className="small text-muted mb-0">{anom.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-dark bg-opacity-30 border border-secondary border-opacity-10 p-4 rounded-4 text-center mb-3">
                  <p className="text-muted small mb-0">✅ No heuristic duplicate entries or spike limits hit.</p>
                </div>
              )}

              {insights?.fraudNarrative && (
                <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
                  {insights.fraudNarrative}
                </p>
              )}
            </div>

          </div>

          {/* RIGHT: COST CHARTS & ADVISOR RECOMMENDATIONS */}
          <div className="col-12 col-lg-5">
            
            {/* SPENDING STATS PANEL */}
            <div className="glass-card p-4 mb-4">
              <h4 className="fw-bold text-warning mb-4 d-flex align-items-center gap-2">
                <FaChartPie /> Category Shares Visualizer
              </h4>

              {insights?.charts?.categoryChart?.length === 0 ? (
                <p className="text-muted small text-center my-3">No category data recorded yet.</p>
              ) : (
                <div className="mb-4">
                  {insights?.charts?.categoryChart?.map((item, idx) => {
                    const totalVal = insights.charts.categoryChart.reduce((a, b) => a + b.value, 0) || 1;
                    const pct = Math.round((item.value / totalVal) * 100);
                    return (
                      <div key={idx} className="mb-3">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>{item.name}</span>
                          <strong>₹{item.value} ({pct}%)</strong>
                        </div>
                        <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                          <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <h5 className="fw-bold text-light border-top pt-3 border-secondary border-opacity-10 mb-3">Member Ledger Contributions</h5>
              {insights?.charts?.memberChart?.length === 0 ? (
                <p className="text-muted small text-center my-2">No contributor records.</p>
              ) : (
                <div>
                  {insights?.charts?.memberChart?.map((item, idx) => {
                    const totalVal = insights.charts.memberChart.reduce((a, b) => a + b.value, 0) || 1;
                    const pct = Math.round((item.value / totalVal) * 100);
                    return (
                      <div key={idx} className="mb-3">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>{item.name}</span>
                          <strong>₹{item.value} ({pct}%)</strong>
                        </div>
                        <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADVISOR RECOMMENDATIONS CARD */}
            <div className="glass-card p-4">
              <h4 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2">
                <FaLightbulb /> Budget Advisor Ideas
              </h4>
              <p className="text-secondary small mb-4">
                Tailored cost management suggestions based on current category aggregates.
              </p>

              <div className="d-flex flex-column gap-3">
                {insights?.budgetAdviser?.map((item, idx) => (
                  <div key={idx} className="d-flex gap-3">
                    <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold" style={{ minWidth: "24px", height: "24px", fontSize: "12px" }}>
                      {idx + 1}
                    </div>
                    <p className="small text-secondary mb-0" style={{ lineHeight: "1.5" }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AIExpenses;
