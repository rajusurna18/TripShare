import React from "react";
import { Link } from "react-router-dom";

const TravelerSafety = () => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    user = null;
  }

  const isAuthenticated = Boolean(token || user);
  const homePath = isAuthenticated ? "/dashboard" : "/";

  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5 rounded-4 border border-secondary border-opacity-20" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>
          
          <h1 className="fw-bold text-warning mb-2">Traveler Safety Guidelines</h1>
          <p className="text-secondary mb-4 small">Last Updated: [Informational Placeholder]</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            <p>
              Your safety is our priority. Whether you are traveling solo or organizing a group trip, please review these safety best practices.
            </p>

            <h4 className="text-warning mt-4 mb-3">1. Online Safety</h4>
            <p>
              Do not share highly sensitive personal information (such as passport details, banking passwords, or your exact home address) through TripShare public profiles or chats with unknown users.
            </p>

            <h4 className="text-warning mt-4 mb-3">2. Meeting New People</h4>
            <p>
              If joining a trip with travelers you have never met:
              <ul>
                <li>Always meet in a public, well-lit place first.</li>
                <li>Share your itinerary and TripShare Live Tracking details with a trusted friend or family member back home.</li>
                <li>Trust your instincts. If a situation feels unsafe, leave.</li>
              </ul>
            </p>

            <h4 className="text-warning mt-4 mb-3">3. Destination Awareness</h4>
            <p>
              Always independently check local government travel advisories for your destination. TripShare AI may not have the most up-to-date real-time emergency, political, or weather alerts.
            </p>
          </div>

          <div className="mt-5 pt-4 border-top border-secondary border-opacity-20">
            <Link to={homePath} className="btn btn-outline-warning rounded-pill px-4">Return Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerSafety;
