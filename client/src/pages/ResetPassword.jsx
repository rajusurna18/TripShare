import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import toast from "react-hot-toast";

function ResetPassword() {

  const navigate =
    useNavigate();

  const [newPassword,
    setNewPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  // SAVED DATA

  const email =
    localStorage.getItem(
      "resetEmail"
    );

  const otp =
    localStorage.getItem(
      "verifiedOTP"
    );

  // PROTECT ROUTE

  useEffect(() => {

    if (!email || !otp) {

      navigate(
        "/forgot-password"
      );

    }

  }, [email, otp, navigate]);

  // SUBMIT

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      // PASSWORD LENGTH

      if (

        newPassword.length < 6

      ) {

        toast.error(

          "Password must be at least 6 characters"

        );

        return;

      }

      // MATCH PASSWORD

      if (

        newPassword !==

        confirmPassword

      ) {

        toast.error(

          "Passwords do not match"

        );

        return;

      }

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

          res.data.message ||

          "Password updated successfully"

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

          err?.response?.data?.message ||

          "Reset failed"

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

            Reset Password

          </h2>

          <p className="auth-subtitle">

            Create a new secure password
            for your account.

          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* NEW PASSWORD */}

          <div className="mb-3">

            <label className="form-label text-light">

              New Password

            </label>

            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              className="form-control auth-input"

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

          {/* CONFIRM PASSWORD */}

          <div className="mb-3">

            <label className="form-label text-light">

              Confirm Password

            </label>

            <input

              type={
                showPassword
                  ? "text"
                  : "password"
              }

              className="form-control auth-input"

              placeholder="Confirm password"

              value={confirmPassword}

              onChange={(e) =>

                setConfirmPassword(
                  e.target.value
                )

              }

              required

            />

          </div>

          {/* SHOW PASSWORD */}

          <div className="form-check mb-4">

            <input

              className="form-check-input"

              type="checkbox"

              checked={
                showPassword
              }

              onChange={() =>

                setShowPassword(
                  !showPassword
                )

              }

            />

            <label className="form-check-label">

              Show Password

            </label>

          </div>

          {/* BUTTON */}

          <button

            type="submit"

            className="btn btn-custom w-100 fw-bold py-3"

            disabled={loading}

          >

            {

              loading

                ? "Updating Password..."

                : "Reset Password"

            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default ResetPassword;