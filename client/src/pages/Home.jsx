import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView, animate } from "framer-motion";
import API from "../services/api";
import ActivityCard from "../components/activity/ActivityCard";
import "./Home.css";

// Framer Motion Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// CountUp Component
function CountUpAnimation({ to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          ref.current.textContent = Math.round(value) + suffix;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to, duration, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

function Home() {
  const navigate = useNavigate();

  // Feed State
  const [activities, setActivities] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedTotalPages, setFeedTotalPages] = useState(1);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "TripShare | AI-Powered Social Travel Platform";
    window.scrollTo(0, 0);
    if (token) {
      fetchFeed(1);
    }
  }, [token]);

  async function fetchFeed(pageNum = 1) {
    try {
      setLoadingFeed(true);
      const res = await API.get(`/activities?feedType=home&page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pageNum === 1) {
        setActivities(res.data.activities || []);
      } else {
        setActivities((prev) => [...prev, ...(res.data.activities || [])]);
      }
      setFeedPage(res.data.page);
      setFeedTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch public feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="overlay"></div>
        <div className="container hero-content">
          <h1>Travel Together. Explore Smarter.</h1>
          <p>The AI-powered travel platform that helps travelers discover companions, plan unforgettable trips, collaborate in real time, split expenses, preserve memories, and create lasting travel stories.</p>
          <button className="btn btn-custom mt-3" onClick={() => navigate("/register")}>Start Your Journey</button>
        </div>
      </section>

      {/* 2. MISSION & VISION */}
      <section className="landing-section" style={{ background: "#0a0a0a" }}>
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="h-100 pe-lg-4">
                <h6 className="text-warning text-uppercase fw-bold letter-spacing-1 mb-2">Our Foundation</h6>
                <h2 className="landing-title mb-4">TripShare is an intelligent travel collaboration platform.</h2>
                <p className="text-secondary mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.7" }}>
                  Whether you're traveling solo or with friends, TripShare helps you plan, connect, and experience every journey together.
                </p>

                <div className="d-flex flex-column gap-4">
                  <div>
                    <h5 className="text-white fw-bold mb-2"><i className="fas fa-bullseye text-warning me-2"></i> Mission</h5>
                    <p className="text-secondary small mb-0">To simplify travel planning through AI and collaboration while helping people build meaningful travel experiences.</p>
                  </div>
                  <div>
                    <h5 className="text-white fw-bold mb-2"><i className="fas fa-eye text-info me-2"></i> Vision</h5>
                    <p className="text-secondary small mb-0">To become the world's most trusted AI-powered travel companion.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6">
              {/* IMPACT STATISTICS */}
              <motion.div className="row g-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="col-6">
                  <div className="stat-box glass-card border-secondary text-center p-4 rounded-4 h-100">
                    <div className="stat-number text-warning fw-bold display-5 mb-2"><CountUpAnimation to={100} suffix="%" /></div>
                    <div className="stat-label text-white small text-uppercase">Collaborative Planning</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-box glass-card border-secondary text-center p-4 rounded-4 h-100">
                    <div className="stat-number text-warning fw-bold display-5 mb-2"><CountUpAnimation to={24} suffix="/7" /></div>
                    <div className="stat-label text-white small text-uppercase">AI Assistance</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-box glass-card border-secondary text-center p-4 rounded-4 h-100">
                    <div className="stat-number text-warning fw-bold display-5 mb-2"><CountUpAnimation to={0} suffix="" /></div>
                    <div className="stat-label text-white small text-uppercase">Hidden Fees</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-box glass-card border-secondary text-center p-4 rounded-4 h-100">
                    <div className="stat-number text-warning fw-bold display-5 mb-2"><CountUpAnimation to={10} suffix="+" /></div>
                    <div className="stat-label text-white small text-uppercase">Smart Tools</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section className="landing-section" style={{ background: "#050505" }}>
        <div className="container text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="landing-title mb-5">Core Features</h2>
          </motion.div>

          <motion.div className="row g-4 mt-2" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { icon: "robot", title: "AI Travel Assistant", desc: "Experience personalized travel itineraries crafted instantly by our Gemini-powered AI." },
              { icon: "handshake", title: "Smart Traveler Matching", desc: "Connect with like-minded explorers based on verified travel preferences and AI matching." },
              { icon: "users", title: "Live Trip Collaboration", desc: "Co-create itineraries with your friends through live syncing and instant updates." },
              { icon: "receipt", title: "Expense Settlement", desc: "Automatically track, split, and settle group expenses without the awkward math." },
              { icon: "suitcase", title: "AI Packing List", desc: "Never forget essentials with dynamic, weather-aware AI-generated packing lists." },
              { icon: "stream", title: "Travel Timeline", desc: "Log locations and transform your journey into a beautiful chronological timeline." },
              { icon: "book-open", title: "Travel Story Generator", desc: "Automatically convert your photos and timeline into stunning interactive travel stories." },
              { icon: "chart-pie", title: "Analytics Dashboard", desc: "Visualize your travel stats, expense categories, and journey history intelligently." }
            ].map((item, index) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={index}>
                <motion.div className="special-card h-100" variants={fadeUp}>
                  <i className={`fas fa-${item.icon} text-warning fs-3 mb-3`}></i>
                  <h5 className="fw-bold text-white">{item.title}</h5>
                  <p className="text-secondary small mb-0">{item.desc}</p>
                </motion.div>
              </div>
            ))}
          </motion.div>

          <div className="mt-5 text-center">
            <Link to="/features" className="btn btn-outline-warning rounded-pill px-4 py-2">Explore All Features</Link>
          </div>
        </div>
      </section>

      {/* 4. WHY TRIPSHARE (COMPARISON) */}
      <section className="landing-section" style={{ background: "#0a0a0a" }}>
        <div className="container">
          <motion.div className="text-center mb-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="landing-title mb-2">Why TripShare?</h2>
            <p className="landing-subtitle">Instead of traditional travel apps.</p>
          </motion.div>

          <motion.div
            className="comparison-table-wrapper overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <table className="comparison-table w-full border-collapse overflow-hidden rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
              <thead>
                <tr className="bg-gradient-to-r from-[#1A2235] via-[#232F47] to-[#1A2235]">
                  <th className="px-8 py-6 text-left text-lg font-bold text-white uppercase tracking-wider border-b border-[#D4AF37]/30">
                    Feature
                  </th>

                  <th className="traditional-col px-8 py-6 text-center text-lg font-bold text-white uppercase tracking-wider border-b border-[#D4AF37]/30">
                    Traditional Apps
                  </th>

                  <th className="highlight-col px-8 py-6 text-center text-lg font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#D4AF37]/50">
                    ⭐ TripShare
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="feature-name">AI Assistant</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Traveler Matching</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Travel Timeline</td>
                  <td className="traditional-col">
                    <i className="fas fa-check"></i> (Basic)
                  </td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Expense Settlement</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Packing Assistant</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Real-Time Chat</td>
                  <td className="traditional-col">
                    <i className="fas fa-check"></i> (Limited)
                  </td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Travel Story Generator</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Live Tracking</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>

                <tr>
                  <td className="feature-name">Analytics Dashboard</td>
                  <td className="traditional-col">—</td>
                  <td className="highlight-col">
                    <i className="fas fa-check-circle"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>



      {/* 6. LIVE TRAVEL FEED (Rendered only if logged in) */}
      {token && (
        <section className="live-feed-section py-5" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <h2 className="section-title text-center text-warning fw-bold mb-4">🌍 Live Travel Feed</h2>
            <p className="text-secondary text-center mb-5" style={{ fontSize: "15px" }}>See what travelers are planning and sharing in real-time.</p>

            {activities.length === 0 && !loadingFeed ? (
              <div className="glass-card p-4 text-center">
                <p className="text-secondary mb-0">No public activities yet. Be the first to share your journey!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {activities.map((activity) => (
                  <ActivityCard key={activity._id} activity={activity} />
                ))}
                {feedPage < feedTotalPages && (
                  <div className="text-center mt-3">
                    <button
                      className="btn btn-outline-warning fw-bold px-4 py-2"
                      disabled={loadingFeed}
                      onClick={() => fetchFeed(feedPage + 1)}
                      style={{ borderRadius: "8px" }}
                    >
                      {loadingFeed ? "Syncing..." : "Load More Activity"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. CALL TO ACTION BANNER */}
      <section className="landing-section pb-5" style={{ background: "#050505" }}>
        <div className="container">
          <motion.div className="cta-banner" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="cta-content">
              <h2 className="fw-bold text-white mb-5" style={{ fontSize: "2.5rem" }}>Ready for Your Next Adventure?</h2>
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <button className="btn btn-outline-light btn-lg fw-bold px-5 rounded-pill" onClick={() => navigate("/login")}>
                  Start Exploring
                </button>
                <button className="btn btn-warning btn-lg fw-bold px-5 rounded-pill" onClick={() => navigate("/register")}>
                  Create Trip
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. ENHANCED FOOTER */}
      <footer className="enhanced-footer">
        <div className="container">
          <div className="row g-5 mb-5">
            <div className="col-lg-4">
              <h3 className="fw-bold text-warning mb-3" style={{ letterSpacing: "1px" }}>TripShare AI</h3>
              <p className="text-secondary mb-4" style={{ fontSize: "0.95rem", maxWidth: "300px" }}>
                The world's smartest AI-powered travel ecosystem. Plan, collaborate, and explore together.
              </p>
              <div className="footer-social-icons">
                <a href="https://github.com" aria-label="GitHub"><i className="fab fa-github"></i></a>
                <a href="https://linkedin.com" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://instagram.com" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="https://twitter.com" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <h5 className="footer-col-title">Product</h5>
              <ul className="footer-links">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/">Pricing <span className="badge bg-secondary ms-1" style={{ fontSize: "0.6rem" }}>Soon</span></Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <h5 className="footer-col-title">Support</h5>
              <ul className="footer-links">
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/contact">FAQ</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
                <li><Link to="/">Terms</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-4 col-12">
              <h5 className="footer-col-title">Resources</h5>
              <ul className="footer-links">
                <li><Link to="/">GitHub</Link></li>
                <li><Link to="/">LinkedIn</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-top border-secondary pt-4 text-center">
            <p className="text-secondary mb-1" style={{ fontSize: "0.9rem" }}>TripShare AI © 2026. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;