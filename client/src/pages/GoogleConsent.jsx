import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

function GoogleConsent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("pendingToken");
    if (!token) {
      toast.error("Invalid Google Registration Session");
      navigate("/login");
    } else {
      setPendingToken(token);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions to continue.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/google/finalize", {
        pendingToken,
        termsAccepted,
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        window.dispatchEvent(new Event("auth-success"));
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to complete Google registration. The session may have expired."
      );
      // If expired or invalid, redirect to login
      if (err.response?.status === 400) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #0c0c0e 0%, #1a1a1f 100%)",
        color: "white",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-5 rounded-4 shadow-lg border border-secondary border-opacity-25"
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "rgba(25, 25, 25, 0.45)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2 className="text-center fw-bold text-warning mb-4">Almost There!</h2>
        <p className="text-center text-light mb-4">
          Your Google account has been verified. To complete your TripShare registration, please review and accept our Terms & Conditions.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="termsCheck"
              className="d-flex align-items-center gap-3 p-3 rounded-3 border border-secondary border-opacity-25 bg-dark bg-opacity-40"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                userSelect: "none",
                borderColor: isHovered || isFocused ? "rgba(255, 193, 7, 0.4)" : "rgba(255, 255, 255, 0.15)",
              }}
            >
              <div className="position-relative flex-shrink-0 d-flex align-items-center justify-content-center">
                <input
                  type="checkbox"
                  id="termsCheck"
                  name="termsCheck"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                  aria-label="I agree to the TripShare Terms & Conditions"
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "22px",
                    height: "22px",
                    borderRadius: "5px",
                    border: termsAccepted
                      ? "2px solid #FFC107"
                      : isHovered || isFocused
                      ? "2px solid #FFC107"
                      : "2px solid rgba(255, 255, 255, 0.65)",
                    backgroundColor: termsAccepted
                      ? "#FFC107"
                      : isHovered
                      ? "rgba(255, 255, 255, 0.16)"
                      : "rgba(255, 255, 255, 0.08)",
                    boxShadow: isFocused
                      ? "0 0 0 3px rgba(255, 193, 7, 0.45)"
                      : isHovered
                      ? "0 0 8px rgba(255, 193, 7, 0.3)"
                      : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "block",
                    outline: "none",
                  }}
                />
                {termsAccepted && (
                  <svg
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "14px",
                      height: "14px",
                      pointerEvents: "none",
                    }}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="#0C0C0E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <span className="text-light small" style={{ fontSize: "14px", lineHeight: "1.4" }}>
                I agree to the TripShare{" "}
                <Link
                  to="/terms"
                  className="text-info text-decoration-none fw-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold rounded-pill text-dark d-flex justify-content-center align-items-center"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default GoogleConsent;
