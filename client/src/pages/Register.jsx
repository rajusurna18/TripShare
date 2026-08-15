import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import toast from "react-hot-toast";

import API from "../services/api";

function Register() {

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      termsAccepted: false,
    });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("token", token);
        localStorage.setItem("user", userStr);
        toast.success("Registration & Login successful with Google 🚀");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse social login credentials");
      }
    } else {
      // Intentionally empty to prevent clearing token during framer-motion page transitions
    }
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!formData.termsAccepted) {
        toast.error("You must accept the Terms & Conditions to register.");
        return;
      }

      try {
        setLoading(true);
        // Clear any old state before starting a fresh registration
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const res = await API.post("/auth/register", formData);
        const data = res.data;

        toast.success(
          "Registration successful 🎉"
        );

        navigate("/login");

      } catch (err) {

        toast.error(
          err.response?.data?.message ||
          "Registration failed"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="container vh-100 d-flex justify-content-center align-items-center">

      <div
        className="card p-4 bg-dark text-white shadow-lg auth-card"
      >

        <h2 className="text-center mb-4 text-warning d-flex justify-content-center align-items-center">
          Join TripShare <img src="/tripshare-logo.png" alt="TripShare Logo" className="d-inline-block" style={{ height: "1.2em", width: "auto", marginLeft: "8px", borderRadius: "50%", objectFit: "cover" }} />
        </h2>

        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <div className="mb-3">

            <label className="form-label">

              Full Name

            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              onChange={handleChange}
              required
            />

          </div>

          {/* EMAIL */}

          <div className="mb-3">

            <label className="form-label">

              Email

            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="mb-3">

            <label className="form-label">

              Password

            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="******"

              pattern="^(?=.*[A-Z])(?=.*[0-9]).{6,}$"

              title="
Password must contain:
- 1 uppercase letter
- 1 number
- Minimum 6 characters
"

              onChange={handleChange}

              required
            />

            <small className="text-secondary">

              Must contain:
              1 uppercase letter,
              1 number,
              minimum 6 characters.

            </small>

          </div>

          {/* TERMS & CONDITIONS */}
          <div className="mb-4 form-check d-flex align-items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              className="form-check-input mt-0 me-2"
              id="termsCheck"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
            <label className="form-check-label text-secondary small" htmlFor="termsCheck">
              I agree to the TripShare <Link to="/terms" className="text-info text-decoration-none">Terms & Conditions</Link>
            </label>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-warning w-100 fw-bold"
          >

            {
              loading
              ? "Creating Account..."
              : "Register"
            }

          </button>

        </form>

        {/* SOCIAL LOGIN */}

        <div className="d-flex align-items-center my-4">
          <hr className="flex-grow-1 border-secondary border-opacity-30" />
          <span className="px-3 text-secondary small text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px" }}>
            OR
          </span>
          <hr className="flex-grow-1 border-secondary border-opacity-30" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="google-signin-btn"
          onClick={() => {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            window.location.href = `${apiBase}/auth/google`;
          }}
          title="Continue with Google"
          aria-label="Continue with Google"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.55 2.88-2.18 5.33-4.63 6.96l7.19 5.57c4.21-3.88 7.19-9.6 7.19-16.79z"/>
            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.19-5.57c-2.2 1.47-5.02 2.38-8.7 2.38-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* LOGIN LINK */}

        <div className="text-center mt-4">

          <p>

            Already have an account?

            <Link
              to="/login"
              className="text-info text-decoration-none ms-2"
            >

              Login

            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Register;