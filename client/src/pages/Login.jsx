import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import toast from "react-hot-toast";

function Login() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const res =
          await fetch(
            "http://localhost:5000/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  formData
                ),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          return toast.error(
            data.message ||
            "Invalid credentials"
          );

        }

        localStorage.setItem(
          "token",
          data.token
        );

        toast.success(
          "Login successful 🚀"
        );

        navigate("/dashboard");

      } catch (err) {

        toast.error(
          "Login failed"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="container vh-100 d-flex justify-content-center align-items-center">

      <div
        className="
          card
          p-4
          bg-dark
          text-white
          shadow-lg
          auth-card
        "
      >

        <h2 className="text-center mb-4 text-warning">

          Welcome Back 🌍

        </h2>

        <form onSubmit={handleSubmit}>

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

          <div className="mb-3">

            <label className="form-label">

              Password

            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="******"
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              btn
              btn-warning
              w-100
              fw-bold
              loading-btn
            "
          >

            {
              loading
              ? "Logging in..."
              : "Login"
            }

          </button>

        </form>

     

        {/* SOCIAL LOGIN */}

        <div className="social-login mt-4">

          <p className="text-center text-light">

            Or continue with

          </p>

          <div className="d-flex justify-content-center gap-3 mt-3">

            <button className="social-btn">

              <i className="fab fa-google"></i>

            </button>

            <button className="social-btn">

              <i className="fab fa-github"></i>

            </button>

            <button className="social-btn">

              <i className="fab fa-facebook-f"></i>

            </button>

          </div>

        </div>

        <div className="text-center mt-4">

          <Link
            to="/forgot-password"
            className="
              text-info
              text-decoration-none
            "
          >

            Forgot Password?

          </Link>

          <p className="mt-3">

            Don’t have an account?

            <Link
              to="/register"
              className="
                text-warning
                text-decoration-none
                ms-2
              "
            >

              Register

            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;