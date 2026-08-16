import { Link, useLocation } from "react-router-dom";
import socket from "../../socket";
import Avatar from "./Avatar";

import {
  useEffect,
  useState,
  useRef
} from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Menu, X, Home, Compass, FileText, Info, Sparkles, Phone, 
  Bell, User, LogIn, LogOut, Bookmark, Settings as SettingsIcon 
} from "lucide-react";

import API from "../../services/api";

function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // CLOSE MOBILE MENU ON ROUTE CHANGE
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  // TOGGLE BODY SCROLL WHEN MOBILE MENU OPENS
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
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
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/profile?simple=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // FETCH NOTIFICATIONS
  async function fetchNotifications() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || res.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchProfile();
    fetchNotifications();

    socket.on("new_notification", () => {
      fetchNotifications();
    });

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
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeTripId");
    window.location.href = "/login";
  };

  // UNREAD COUNT
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { name: "Home", path: "/", Icon: Home },
    { name: "Discover", path: "/discover", Icon: Compass },
    { name: "Blogs", path: "/blogs", Icon: FileText },
    { name: "About", path: "/about", Icon: Info },
    { name: "Features", path: "/features", Icon: Sparkles },
    { name: "Contact", path: "/contact", Icon: Phone },
  ];

  // FRAMER MOTION VARIANTS
  const menuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "calc(100dvh - 68px)", // 68px is approx navbar height
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.35,
        ease: [0.25, 1, 0.5, 1],
        when: "beforeChildren",
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: "easeInOut",
        when: "afterChildren",
        staggerChildren: shouldReduceMotion ? 0 : 0.04,
        staggerDirection: -1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: shouldReduceMotion ? 0 : 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }
    },
    exit: {
      y: shouldReduceMotion ? 0 : -10,
      opacity: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: "easeIn" }
    }
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark position-sticky top-0 shadow-sm" 
      style={{ 
        zIndex: 1000, 
        backdropFilter: isMobileMenuOpen ? 'blur(24px)' : 'blur(14px)', 
        background: isMobileMenuOpen ? 'rgba(10, 10, 15, 0.98)' : 'rgba(10, 10, 20, 0.85)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        minHeight: '68px', 
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease' 
      }}
    >
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between">
        {/* LOGO */}
        <Link className="navbar-brand d-flex align-items-center m-0 py-1 transition-transform hover:scale-105" to="/" style={{ zIndex: 1001 }}>
          <img src="/tripshare-logo.png" alt="TripShare Logo" className="d-inline-block" style={{ height: "36px", width: "36px", marginRight: "12px", borderRadius: "50%", objectFit: "cover", border: '1px solid rgba(255,193,7,0.3)' }} />
          <span className="fs-4 fw-bold d-none d-sm-inline" style={{ color: '#ffc107', letterSpacing: '0.5px' }}>TripShare</span>
        </Link>

        {/* MOBILE BUTTON */}
        <button
          className="d-lg-none bg-transparent border-0 text-warning p-2 d-flex align-items-center justify-content-center"
          style={{ width: "48px", height: "48px", zIndex: 1001, transform: "scale(0.98)" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: shouldReduceMotion ? 0 : -90, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: shouldReduceMotion ? 0 : 90, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.25, ease: "easeInOut" }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: shouldReduceMotion ? 0 : 90, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: shouldReduceMotion ? 0 : -90, opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.25, ease: "easeInOut" }}
              >
                <Menu size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* DESKTOP NAVBAR */}
        <div className="d-none d-lg-flex align-items-center ms-auto">
          <ul className="navbar-nav align-items-center gap-1 gap-xl-2 m-0 p-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.name}>
                <Link
                  className={`nav-link px-2 py-2 fw-medium position-relative transition-all duration-300 d-flex align-items-center gap-2 ${location.pathname === link.path ? 'active text-warning' : 'text-light text-opacity-75 hover:text-warning hover:bg-white hover:bg-opacity-5 rounded'}`}
                  to={link.path}
                >
                  <link.Icon size={18} strokeWidth={location.pathname === link.path ? 2.5 : 2} />
                  <span>{link.name}</span>
                  {location.pathname === link.path && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="position-absolute bottom-0 start-0 w-100 bg-warning"
                      style={{ height: '2px', borderRadius: '2px' }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}

            {/* SEPARATOR */}
            <li className="nav-item mx-2 d-none d-xl-block">
               <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
            </li>

            {user ? (
              <>
                {/* NOTIFICATION */}
                <li className="nav-item position-relative mx-1">
                  <Link 
                    className={`nav-link p-2 d-flex align-items-center justify-content-center transition-colors rounded-circle ${location.pathname === "/notifications" ? 'text-warning bg-white bg-opacity-10' : 'text-light text-opacity-75 hover:text-warning hover:bg-white hover:bg-opacity-5'}`} 
                    to="/notifications" 
                    aria-label="Notifications" 
                    style={{ width: '40px', height: '40px' }}
                  >
                    <Bell size={20} strokeWidth={location.pathname === "/notifications" ? 2.5 : 2} />
                  </Link>
                  {unreadCount > 0 && (
                    <span className="position-absolute bg-danger text-white rounded-pill d-flex align-items-center justify-content-center fw-bold" style={{ top: '2px', right: '0px', width: '18px', height: '18px', fontSize: '10px', border: '2px solid rgba(10, 10, 20, 0.85)' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </li>

                {/* PROFILE */}
                <li className="nav-item position-relative ms-1" ref={dropdownRef}>
                  <button
                    className="nav-link bg-transparent border-0 d-flex align-items-center gap-2 p-0 rounded-circle transition-transform hover:scale-105"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-label="Profile Menu"
                  >
                    <Avatar
                      src={user?.profileImage}
                      alt="profile"
                      className="navbar-profile"
                      size={40}
                      style={{ border: isDropdownOpen || location.pathname === "/profile" ? '2px solid #ffc107' : '2px solid transparent', padding: '2px', backgroundColor: 'rgba(255,193,7,0.1)' }}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15, scale: shouldReduceMotion ? 1 : 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.95 }}
                        transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, type: shouldReduceMotion ? 'tween' : 'spring', stiffness: 300, damping: 25 }}
                        className="position-absolute end-0 mt-3 p-2 border rounded-4 shadow-lg"
                        style={{ width: "260px", background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(24px)', borderColor: 'rgba(212,175,55,0.2)', zIndex: 1050 }}
                      >
                        {/* Profile Header */}
                        <div className="d-flex align-items-center gap-3 p-3 mb-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <Avatar src={user?.profileImage} alt="profile" size={44} style={{ border: '2px solid rgba(255,193,7,0.5)' }} />
                          <div className="d-flex flex-column overflow-hidden">
                            <span className="text-white fw-bold fs-6 text-truncate mb-0 lh-1">{user?.name || "Traveler"}</span>
                            <span className="text-light text-opacity-50 small text-truncate m-0 mt-1">{user?.email}</span>
                          </div>
                        </div>

                        <ul className="list-unstyled m-0 p-0">
                          <li>
                            <Link
                              className="d-flex align-items-center gap-3 text-decoration-none w-100 p-2 rounded-3 transition-all duration-200 hover:bg-white hover:bg-opacity-10 group"
                              to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <User size={18} className="text-light text-opacity-50 group-hover:text-warning transition-colors" />
                              <span className="text-light fw-medium small m-0 group-hover:text-white transition-colors">Profile</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="d-flex align-items-center gap-3 text-decoration-none w-100 p-2 rounded-3 transition-all duration-200 hover:bg-white hover:bg-opacity-10 group"
                              to="/saved-trips"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <Bookmark size={18} className="text-light text-opacity-50 group-hover:text-warning transition-colors" />
                              <span className="text-light fw-medium small m-0 group-hover:text-white transition-colors">Saved Trips</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              className="d-flex align-items-center gap-3 text-decoration-none w-100 p-2 rounded-3 transition-all duration-200 hover:bg-white hover:bg-opacity-10 group"
                              to="/settings"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <SettingsIcon size={18} className="text-light text-opacity-50 group-hover:text-warning transition-colors" />
                              <span className="text-light fw-medium small m-0 group-hover:text-white transition-colors">Settings</span>
                            </Link>
                          </li>
                          <li>
                            <hr className="my-2 mx-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                          </li>
                          <li>
                            <button
                              className="d-flex align-items-center gap-3 border-0 bg-transparent w-100 p-2 rounded-3 transition-all duration-200 text-start hover:bg-white hover:bg-opacity-10 group"
                              onClick={() => {
                                setIsDropdownOpen(false);
                                logout();
                              }}
                            >
                              <LogOut size={18} className="text-danger opacity-75 group-hover:opacity-100 transition-colors" />
                              <span className="text-danger opacity-75 fw-medium small m-0 group-hover:opacity-100 transition-colors">Logout</span>
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-2">
                <Link className="btn rounded-pill px-4 fw-semibold transition-transform shadow-sm hover:scale-105 d-flex align-items-center gap-2" to="/login" style={{ backgroundColor: '#ffc107', color: '#000' }}>
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* MOBILE FULL-WIDTH DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="d-lg-none position-absolute start-0 w-100 overflow-y-auto"
            style={{ 
              top: "100%", 
              height: "calc(100dvh - 68px)",
              background: "rgba(10, 10, 15, 0.98)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              zIndex: 999 
            }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="container-fluid px-4 py-3 d-flex flex-column h-100">
              <ul className="list-unstyled m-0 d-flex flex-column gap-1 flex-grow-1">
                
                {/* PRIMARY NAV */}
                {navLinks.map((link) => (
                  <motion.li key={link.name} variants={itemVariants}>
                    <Link
                      className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none transition-all duration-200 active:scale-95"
                      style={{
                        backgroundColor: location.pathname === link.path ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                        color: location.pathname === link.path ? '#ffc107' : 'rgba(255,255,255,0.85)',
                        fontWeight: location.pathname === link.path ? '600' : '400'
                      }}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                        <link.Icon size={20} strokeWidth={location.pathname === link.path ? 2.5 : 2} />
                      </div>
                      <span className="fs-5">{link.name}</span>
                    </Link>
                  </motion.li>
                ))}

                {/* DIVIDER 1 */}
                <motion.li variants={itemVariants}>
                  <hr className="border-secondary opacity-25 my-2 mx-2" />
                </motion.li>

                {/* NOTIFICATIONS */}
                <motion.li variants={itemVariants}>
                  <Link
                    className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none transition-all duration-200 active:scale-95 hover:bg-white hover:bg-opacity-5"
                    style={{
                      backgroundColor: location.pathname === "/notifications" ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                      color: location.pathname === "/notifications" ? '#ffc107' : 'rgba(255,255,255,0.85)',
                      fontWeight: location.pathname === "/notifications" ? '600' : '400'
                    }}
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                     <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '24px' }}>
                        <Bell size={20} strokeWidth={location.pathname === "/notifications" ? 2.5 : 2} />
                        {unreadCount > 0 && (
                          <span className="position-absolute bg-danger text-white rounded-pill d-flex align-items-center justify-content-center fw-bold" style={{ top: '-4px', right: '-8px', minWidth: '16px', height: '16px', fontSize: '10px', border: '2px solid rgba(10, 10, 15, 0.98)', padding: '0 4px' }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                     </div>
                     <span className="fs-5">Notifications</span>
                  </Link>
                </motion.li>

                {/* DIVIDER 2 */}
                <motion.li variants={itemVariants}>
                  <hr className="border-secondary opacity-25 my-2 mx-2" />
                </motion.li>

                {/* PROFILE / LOGIN */}
                {user ? (
                  <motion.li variants={itemVariants} className="mt-auto pt-2 pb-4">
                    <Link
                      className="d-flex align-items-center justify-content-between p-3 rounded-3 text-decoration-none transition-all duration-200 active:scale-95 hover:bg-white hover:bg-opacity-5"
                      style={{
                        backgroundColor: location.pathname === "/profile" ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                        color: location.pathname === "/profile" ? '#ffc107' : 'rgba(255,255,255,0.85)',
                        fontWeight: location.pathname === "/profile" ? '600' : '400'
                      }}
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '32px' }}>
                          <Avatar
                            src={user?.profileImage}
                            alt="profile"
                            size={32}
                            style={{ border: location.pathname === "/profile" ? '2px solid #ffc107' : '1px solid rgba(255,255,255,0.2)' }}
                          />
                        </div>
                        <span className="fs-5">{user?.name || "Profile"}</span>
                      </div>
                    </Link>
                  </motion.li>
                ) : (
                  <motion.li variants={itemVariants} className="mt-auto pt-2 pb-4">
                    <Link
                      className="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none fw-semibold transition-all duration-200 active:scale-95 hover:bg-white hover:bg-opacity-5"
                      style={{
                        backgroundColor: location.pathname === "/login" ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                        color: location.pathname === "/login" ? '#ffc107' : 'rgba(255,255,255,0.85)',
                        fontWeight: location.pathname === "/login" ? '600' : '400'
                      }}
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="d-flex align-items-center justify-content-center" style={{ width: '24px' }}>
                        <LogIn size={20} />
                      </div>
                      <span className="fs-5">Login</span>
                    </Link>
                  </motion.li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
