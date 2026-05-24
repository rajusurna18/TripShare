import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import toast from "react-hot-toast";

function VerifyOTP() {

  const navigate =
    useNavigate();

  const [otp, setOTP] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const email =
    localStorage.getItem(
      "resetEmail"
    );

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res =
          await API.post(

            "/api/auth/verify-otp",

            {
              email,
              otp,
            }

          );

        toast.success(
          res.data.message
        );

        localStorage.setItem(
          "verifiedOTP",
          otp
        );

        navigate(
          "/reset-password"
        );

      } catch (err) {

        toast.error(

          err.response?.data?.message ||

          "Invalid OTP"

        );

      } finally {

        setLoading(false);

      }

  };

  return (

    <div className="container vh-100 d-flex justify-content-center align-items-center">

      <div
        className="card bg-dark text-light p-4 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "20px",
          border: "1px solid #facc15",
        }}
      >

        <h2 className="text-center text-warning mb-4">

          Verify OTP ✉️

        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label">

              Enter OTP

            </label>

            <input
              type="text"
              className="form-control"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOTP(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold"
            disabled={loading}
          >

            {

              loading

                ? "Verifying..."

                : "Verify OTP"

            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default VerifyOTP;