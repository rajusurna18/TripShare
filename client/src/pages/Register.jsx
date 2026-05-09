import { useState } from "react";
import { register } from "../services/auth.api";
import { useNavigate, Link } from "react-router-dom";


function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      alert("Registration successful 🎉");

      navigate("/login");

    } catch (err) {

      console.log(err);

      alert("Registration failed");

    }

  };

  return (

    <div className="container vh-100 d-flex justify-content-center align-items-center">

      <div
        className="card p-4 bg-dark text-white shadow-lg"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "20px",
          border: "1px solid #FFD700"
        }}
      >

        <h2 className="text-center mb-4 text-warning">
          Join TripShare ✈️
        </h2>

        <form onSubmit={handleSubmit}>

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
            className="btn btn-warning w-100 fw-bold"
          >
            Register
          </button>

        </form>

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