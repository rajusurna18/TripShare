import { useState } from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";

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

        const res = await API.post("/auth/register", formData);

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

        <h2 className="text-center mb-4 text-warning">

          Join TripShare ✈️

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