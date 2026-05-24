import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import toast from "react-hot-toast";

function ResetPassword() {

  const navigate =
    useNavigate();

  const [newPassword,
    setNewPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // GET SAVED DATA

  const email =
    localStorage.getItem(
      "resetEmail"
    );

  const otp =
    localStorage.getItem(
      "verifiedOTP"
    );

  // SUBMIT

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res =
          await API.post(

            "/api/auth/reset-password",

            {

              email,

              otp,

              newPassword,

            }

          );

        toast.success(
          res.data.message
        );

        // CLEAR STORAGE

        localStorage.removeItem(
          "resetEmail"
        );

        localStorage.removeItem(
          "verifiedOTP"
        );

        // REDIRECT

        navigate("/login");

      } catch (err) {

        toast.error(

          err.response?.data?.message ||

          "Reset failed"

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

          Reset Password 🔑

        </h2>

        <form onSubmit={handleSubmit}>

          {/* PASSWORD */}

          <div className="mb-3">

            <label className="form-label">

              New Password

            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold"
            disabled={loading}
          >

            {

              loading

                ? "Updating..."

                : "Reset Password"

            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default ResetPassword;