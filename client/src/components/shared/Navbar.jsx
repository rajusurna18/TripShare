import { Link } from "react-router-dom";

function Navbar() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  return (

    <nav className="navbar navbar-expand-lg navbar-dark">

      <div className="container-fluid">

        <Link
          className="navbar-brand"
          to="/"
        >
          TripShare
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >

          <span className="navbar-toggler-icon"></span>

        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav ms-auto align-items-center gap-3">

            <li className="nav-item">

              <Link
                className="nav-link active"
                to="/"
              >
                Home
              </Link>

            </li>

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/about"
              >
                About
              </Link>

            </li>

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/features"
              >
                Features
              </Link>

            </li>

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/contact"
              >
                Contact
              </Link>

            </li>

            {/* NOTIFICATION */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/notifications"
              >
                🔔
              </Link>

            </li>

            {/* PROFILE IMAGE */}

            <li className="nav-item">

              <Link
                to="/profile"
                className="nav-profile"
              >

                <img
                  src={
                    user?.profileImage ||
                    "https://i.pravatar.cc/40"
                  }
                  alt="profile"
                />

              </Link>

            </li>

          </ul>

        </div>

      </div>

    </nav>

  );
}

export default Navbar;