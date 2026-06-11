
import { Link } from "react-router-dom";
import socket from "../../socket";

import {
  useEffect,
  useState,
} from "react";

import API
from "../../services/api";

function Navbar() {

  const [notifications,
    setNotifications] =
    useState([]);

  const [user,
    setUser] =
    useState(null);

  // FETCH PROFILE

  const fetchProfile =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token)
          return;

        const res =
          await API.get(

            "/profile",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setUser(res.data);

      } catch (err) {

        console.log(err);

      }

  };

  // FETCH NOTIFICATIONS

  const fetchNotifications =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token)
          return;

        const res =
          await API.get(

            "/notifications",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setNotifications(

          res.data.notifications ||

          res.data ||

          []

        );

      } catch (err) {

        console.log(err);

      }

  };

useEffect(() => {

  fetchProfile();

  fetchNotifications();

  socket.on(

    "new_notification",

    () => {

      fetchNotifications();

    }

  );

  return () => {

    socket.off(
      "new_notification"
    );

  };

}, []);

  // LOGOUT

  const logout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "activeTripId"
      );

      window.location.href =
        "/login";

  };

  // UNREAD COUNT

  const unreadCount =

    notifications.filter(
      (n) => !n.read
    ).length;

  return (

    <nav className="navbar navbar-expand-lg navbar-dark">

      <div className="container-fluid">

        {/* LOGO */}

        <Link
          className="navbar-brand"
          to="/"
        >

          TripShare

        </Link>

        {/* MOBILE BUTTON */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >

          <span className="navbar-toggler-icon"></span>

        </button>

        {/* NAVBAR */}

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav ms-auto gap-3">

            {/* HOME */}

            <li className="nav-item">

              <Link
                className="nav-link active"
                to="/"
              >

                Home

              </Link>

            </li>

            {/* ABOUT */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/about"
              >

                About

              </Link>

            </li>

            {/* FEATURES */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/features"
              >

                Features

              </Link>

            </li>

            {/* CONTACT */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/contact"
              >

                Contact

              </Link>

            </li>

            {/* NOTIFICATION */}

            <li className="nav-item position-relative">

              <Link
                className="nav-link"
                to="/notifications"
              >

                🔔

              </Link> 

              {

                unreadCount > 0 && (

                  <span className="notification-badge">

                    {unreadCount}

                  </span>

                )

              }

            </li>

            {/* PROFILE */}

            <li className="nav-item dropdown">

              <button

                className="nav-link bg-transparent border-0 d-flex align-items-center gap-2 text-light"

                data-bs-toggle="dropdown"

              >

                <img

                  src={

                    user?.profileImage ||

                    "https://i.pravatar.cc/40"

                  }

                  alt="profile"

                  className="navbar-profile"

                />

              </button>

              <ul className="dropdown-menu dropdown-menu-end">

                <li>

                  <Link

                    className="dropdown-item"

                    to="/profile"

                  >

                    👤 Edit Profile

                  </Link>

                </li>

                <li>

                  <Link

                    className="dropdown-item"

                    to="/settings"

                  >

                    ⚙️ Settings

                  </Link>

                </li>

                <li>

                  <hr className="dropdown-divider" />

                </li>

                <li>

                  <button

                    className="dropdown-item text-danger"

                    onClick={logout}

                  >

                    🚪 Logout

                  </button>

                </li>

              </ul>

            </li>

          </ul>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;

