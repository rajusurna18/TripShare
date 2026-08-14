
import { Link, useLocation } from "react-router-dom";
import socket from "../../socket";
import Avatar from "./Avatar";

import {
  useEffect,
  useState,
  useRef
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
    
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // CLOSE MOBILE MENU ON ROUTE CHANGE
  useEffect(() => {
    const navbarCollapse = document.getElementById("navbarNav");
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      if (window.bootstrap && window.bootstrap.Collapse) {
        const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
          return;
        }
      }
      navbarCollapse.classList.remove("show");
      const toggler = document.querySelector(".navbar-toggler");
      if (toggler) {
        toggler.classList.add("collapsed");
        toggler.setAttribute("aria-expanded", "false");
      }
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // FETCH PROFILE

  async function fetchProfile() {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token)
          return;

        const res =
          await API.get(

            "/profile?simple=true",

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

  async function fetchNotifications() {

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

    const handleAuthExpired = () => {
      setUser(null);
      setNotifications([]);
    };

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      socket.off("new_notification");
      window.removeEventListener("auth-expired", handleAuthExpired);
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
          className="navbar-brand d-flex align-items-center"
          to="/"
        >
          <img src="/tripshare-logo.png" alt="TripShare Logo" className="d-inline-block" style={{ height: "36px", width: "auto", marginRight: "8px", borderRadius: "50%", objectFit: "cover" }} />
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

            {/* DISCOVER */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/discover"
              >

                Discover

              </Link>

            </li>

            {/* BLOGS */}

            <li className="nav-item">

              <Link
                className="nav-link"
                to="/blogs"
              >

                Blogs

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
            <li className="nav-item position-relative" ref={dropdownRef}>
              <button
                className="nav-link bg-transparent border-0 d-flex align-items-center gap-2 text-light"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                <Avatar
                  src={user?.profileImage}
                  alt="profile"
                  className="navbar-profile"
                  size={40}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 p-2 bg-[#0A0A0C] border border-[rgba(212,175,55,0.20)] rounded-[22px] w-[300px] backdrop-blur-[24px] shadow-[0_25px_70px_rgba(0,0,0,0.55)] z-50">
                  
                  {/* Profile Header */}
                  <div className="d-flex align-items-center gap-3 p-[16px] mb-2 border-b border-[rgba(212,175,55,0.1)]">
                    <Avatar src={user?.profileImage} alt="profile" size={48} />
                    <div className="d-flex flex-column overflow-hidden">
                      <span className="text-white fw-bold text-sm m-0 text-truncate">{user?.name || "Traveler"}</span>
                      <span className="text-[#A1A1AA] text-xs m-0 text-truncate">{user?.email}</span>
                      <span className="text-[#D4AF37] text-xs mt-1 fw-semibold">Traveler</span>
                    </div>
                  </div>

                  <ul className="list-unstyled m-0 p-0">
                    <li>
                      <Link
                        className="d-flex align-items-center gap-3 text-decoration-none w-100 h-[68px] p-[14px] rounded-[16px] transition-all duration-300 hover:bg-[rgba(212,175,55,0.07)] hover:translate-x-[4px] group"
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="text-xl text-[#A1A1AA] transition-colors duration-300 group-hover:text-[#D4AF37]">👤</span>
                        <div className="d-flex flex-column">
                          <span className="text-white fw-bold text-sm m-0 leading-tight">Edit Profile</span>
                          <span className="text-[#A1A1AA] text-xs m-0 leading-tight group-hover:text-gray-300 transition-colors">Update your travel profile</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="d-flex align-items-center gap-3 text-decoration-none w-100 h-[68px] p-[14px] rounded-[16px] transition-all duration-300 hover:bg-[rgba(212,175,55,0.07)] hover:translate-x-[4px] group"
                        to="/saved-trips"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="text-xl text-[#A1A1AA] transition-colors duration-300 group-hover:text-[#D4AF37]">⭐</span>
                        <div className="d-flex flex-column">
                          <span className="text-white fw-bold text-sm m-0 leading-tight">Saved Trips</span>
                          <span className="text-[#A1A1AA] text-xs m-0 leading-tight group-hover:text-gray-300 transition-colors">Your saved journeys</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="d-flex align-items-center gap-3 text-decoration-none w-100 h-[68px] p-[14px] rounded-[16px] transition-all duration-300 hover:bg-[rgba(212,175,55,0.07)] hover:translate-x-[4px] group"
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="text-xl text-[#A1A1AA] transition-colors duration-300 group-hover:text-[#D4AF37]">⚙️</span>
                        <div className="d-flex flex-column">
                          <span className="text-white fw-bold text-sm m-0 leading-tight">Settings</span>
                          <span className="text-[#A1A1AA] text-xs m-0 leading-tight group-hover:text-gray-300 transition-colors">Preferences and privacy</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <hr className="border-[rgba(212,175,55,0.1)] my-1 mx-2" />
                    </li>

                    <li>
                      <button
                        className="d-flex align-items-center gap-3 border-0 bg-transparent w-100 h-[68px] p-[14px] rounded-[16px] transition-all duration-300 hover:bg-[rgba(239,68,68,0.1)] hover:translate-x-[4px] group"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                      >
                        <span className="text-xl text-[#A1A1AA] transition-colors duration-300 group-hover:text-[#EF4444]">🚪</span>
                        <div className="d-flex flex-column text-start">
                          <span className="text-white group-hover:text-[#EF4444] fw-bold text-sm m-0 leading-tight transition-colors">Logout</span>
                          <span className="text-[#A1A1AA] text-xs m-0 leading-tight group-hover:text-gray-300 transition-colors">Sign out of TripShare</span>
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>

          </ul>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;

