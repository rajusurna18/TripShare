import { Link } from "react-router-dom";

function ForgotPassword() {

  return (

    <div className="container vh-100 d-flex justify-content-center align-items-center">

      <div
        className="card p-4 bg-dark text-white shadow-lg"
        style={{
          maxWidth: "450px",
          width: "100%",
          borderRadius: "20px",
          border: "1px solid #FFD700"
        }}
      >

        <h2 className="text-center mb-4 text-warning">
          Reset Password 🔑
        </h2>

        <form>

          <div className="mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold"
          >
            Send Reset Link
          </button>

        </form>

        <div className="text-center mt-4">

          <Link
            to="/login"
            className="text-info text-decoration-none"
          >
            Back to Login
          </Link>

        </div>

      </div>

    </div>

  );
}

export default ForgotPassword;