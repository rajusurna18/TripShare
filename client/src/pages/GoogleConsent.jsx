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
          <div className="mb-4 form-check d-flex align-items-center justify-content-center">
            <input
              type="checkbox"
              className="form-check-input mt-0 me-2"
              id="termsCheck"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label
              className="form-check-label text-secondary small"
              htmlFor="termsCheck"
            >
              I agree to the TripShare{" "}
              <Link to="/terms" className="text-info text-decoration-none" target="_blank">
                Terms & Conditions
              </Link>
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
