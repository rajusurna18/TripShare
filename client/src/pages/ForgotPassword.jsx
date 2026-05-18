import { Link } from "react-router-dom";

function ForgotPassword() {

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
            and we’ll send you a
            password reset link.

          </p>

        </div>

        {/* FORM */}

        <form>

          <div className="mb-4">

            <label className="form-label text-light">

              Email Address

            </label>

            <input
              type="email"
              className="form-control auth-input"
              placeholder="Enter your email"
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-custom w-100 fw-bold py-3"
          >

            Send Reset Link

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