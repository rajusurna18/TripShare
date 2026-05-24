import { Link,
  useNavigate } from "react-router-dom";

import { useState } from "react";

import API from "../services/api";

import toast from "react-hot-toast";

function ForgotPassword() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res =
          await API.post(

            "/api/auth/forgot-password",

            { email }

          );

        toast.success(
          res.data.message
        );

        // SAVE EMAIL

        localStorage.setItem(
          "resetEmail",
          email
        );

        navigate("/verify-otp");

      } catch (err) {

        toast.error(

          err.response?.data?.message ||

          "Something went wrong"

        );

      } finally {

        setLoading(false);

      }

  };

  return (

    <div className="auth-page d-flex justify-content-center align-items-center min-vh-100">

      <div className="auth-card glass-card p-5">

        {/* HEADER */}

        <div className="text-center mb-4">

          <div className="auth-icon mb-3">

            🔑

          </div>

          <h2 className="text-warning fw-bold">

            Forgot Password

          </h2>

          <p className="auth-subtitle">

            Enter your email address
            and we’ll send you an OTP
            to reset your password.

          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="mb-4">

            <label className="form-label text-light">

              Email Address

            </label>

            <input
              type="email"
              className="form-control auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-custom w-100 fw-bold py-3"
            disabled={loading}
          >

            {

              loading

                ? "Sending OTP..."

                : "Send OTP"

            }

          </button>

        </form>

        {/* FOOTER */}

        <div className="text-center mt-4">

          <Link
            to="/login"
            className="auth-link"
          >

            ← Back to Login

          </Link>

        </div>

      </div>

    </div>

  );

}

export default ForgotPassword;