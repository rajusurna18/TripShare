import { useState, useEffect } from "react";
import API from "../../services/api";
import { FaShieldAlt, FaTimes, FaCheckCircle, FaExclamationTriangle, FaClock, FaReceipt } from "react-icons/fa";

function AuditTrailModal({ transactionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transactionId) {
      fetchAuditTrail();
    }
  }, [transactionId]);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/travel-commerce/audit/${transactionId}`);
      if (res.data.success) {
        setAuditData(res.data.transaction);
      }
    } catch (err) {
      console.error("Failed to load audit trail:", err);
      setError("Unable to load audit log details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(6px)",
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        className="bg-dark text-light rounded-4 border border-secondary border-opacity-30 shadow-lg d-flex flex-column w-100 overflow-hidden"
        style={{ maxWidth: "680px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="d-flex justify-content-between align-items-center p-3.5 px-4 border-bottom border-secondary border-opacity-20 bg-black bg-opacity-40">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-warning bg-opacity-15 text-warning">
              <FaShieldAlt size={18} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-warning" style={{ fontSize: "16px" }}>
                TripShare AI Commerce Audit Trail
              </h5>
              <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
                Transparent Money Action & Decision Verification Log
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: "32px", height: "32px" }}
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 overflow-y-auto flex-grow-1" style={{ scrollbarWidth: "thin" }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status" />
              <p className="small text-secondary mt-2 mb-0">Retrieving audit ledger...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger p-3 rounded-3 small mb-0">⚠️ {error}</div>
          ) : auditData ? (
            <div className="d-flex flex-column gap-3">
              
              {/* SUMMARY HEADER CARD */}
              <div className="p-3 rounded-3 border border-secondary border-opacity-20 bg-black bg-opacity-50 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="badge bg-warning text-dark fw-bold px-2.5 py-1">
                    Track 01 Agentic Commerce
                  </span>
                  <span className="small text-secondary font-monospace" style={{ fontSize: "11px" }}>
                    ID: {auditData.requestId || auditData._id}
                  </span>
                </div>

                <div className="row g-2 mt-1">
                  <div className="col-6 col-sm-3">
                    <span className="text-secondary small d-block" style={{ fontSize: "11px" }}>Total Budget</span>
                    <strong className="text-light">₹{auditData.parsedIntent?.totalBudgetLimit?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="col-6 col-sm-3">
                    <span className="text-secondary small d-block" style={{ fontSize: "11px" }}>Calculated Option</span>
                    <strong className="text-warning">₹{auditData.aiRecommendation?.totalAmount?.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="col-6 col-sm-3">
                    <span className="text-secondary small d-block" style={{ fontSize: "11px" }}>Policy Status</span>
                    <span className={`badge ${auditData.budgetValidation?.allowed ? "bg-success" : "bg-danger"}`}>
                      {auditData.budgetValidation?.status}
                    </span>
                  </div>
                  <div className="col-6 col-sm-3">
                    <span className="text-secondary small d-block" style={{ fontSize: "11px" }}>Payment State</span>
                    <span className="badge bg-secondary font-monospace">{auditData.status}</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE OF AUDIT EVENTS */}
              <h6 className="fw-bold text-light mt-2 mb-1 d-flex align-items-center gap-2" style={{ fontSize: "14px" }}>
                <FaClock className="text-warning" size={13} /> Decision & Execution Trajectory
              </h6>

              <div className="position-relative ps-3 border-start border-warning border-opacity-40 ms-2 d-flex flex-column gap-3 py-1">
                {auditData.auditTrail?.map((event, idx) => (
                  <div key={idx} className="position-relative ps-3">
                    {/* DOT */}
                    <div
                      className="position-absolute rounded-circle bg-warning"
                      style={{
                        width: "10px",
                        height: "10px",
                        left: "-18px",
                        top: "5px",
                        boxShadow: "0 0 8px rgba(255,193,7,0.6)",
                      }}
                    />

                    <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-20">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 font-monospace" style={{ fontSize: "10px" }}>
                          {event.stage}
                        </span>
                        <span className="small text-secondary" style={{ fontSize: "10px" }}>
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="small text-light mb-1" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                        {event.message}
                      </p>

                      {event.details && (
                        <div className="p-2 rounded bg-black bg-opacity-70 border border-secondary border-opacity-10 mt-2 font-monospace text-secondary" style={{ fontSize: "11px" }}>
                          {Object.entries(event.details).map(([k, v]) => (
                            <div key={k} className="d-flex justify-content-between">
                              <span>{k}:</span>
                              <span className="text-light">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RAZORPAY VERIFICATION LEDGER DETAILS */}
              {auditData.razorpayOrderId && (
                <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mt-2">
                  <h6 className="small text-warning fw-bold mb-2 d-flex align-items-center gap-1.5">
                    <FaReceipt size={12} /> Razorpay Test Gateway Ledger
                  </h6>
                  <div className="row g-2 small text-secondary font-monospace" style={{ fontSize: "11px" }}>
                    <div className="col-12 col-sm-6">Razorpay Order ID: <span className="text-light">{auditData.razorpayOrderId}</span></div>
                    <div className="col-12 col-sm-6">Payment ID: <span className="text-light">{auditData.razorpayPaymentId || "Pending / N/A"}</span></div>
                    <div className="col-12 col-sm-6">HMAC Verified: <span className={auditData.razorpaySignatureVerified ? "text-success" : "text-warning"}>{auditData.razorpaySignatureVerified ? "YES (Timing-Safe SHA256)" : "NO"}</span></div>
                    <div className="col-12 col-sm-6">Confirmation Gate: <span className={auditData.userConfirmed ? "text-success" : "text-danger"}>{auditData.userConfirmed ? "EXPLICIT USER APPROVAL" : "PENDING"}</span></div>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 border-top border-secondary border-opacity-20 bg-black bg-opacity-50 text-end">
          <button className="btn btn-warning btn-sm fw-bold px-4 rounded-3 text-dark" onClick={onClose}>
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditTrailModal;
