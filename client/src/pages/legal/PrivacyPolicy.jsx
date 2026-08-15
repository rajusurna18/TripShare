import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5 rounded-4 border border-secondary border-opacity-20" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>
          
          <h1 className="fw-bold text-warning mb-2">Privacy Policy</h1>
          <p className="text-secondary mb-4 small">Last Updated: [Informational Placeholder]</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            <p>
              Your privacy is critically important to us. This placeholder Privacy Policy describes how we collect, use, and handle your information.
            </p>

            <h4 className="text-warning mt-4 mb-3">1. Information We Collect</h4>
            <p>
              We collect information you provide directly to us when you register, such as your name, email address, travel preferences, and profile details. We also securely track your saved trips, expenses, and AI chat histories to provide a personalized experience.
            </p>

            <h4 className="text-warning mt-4 mb-3">2. How We Use Your Information</h4>
            <p>
              We use the collected data to maintain our Service, manage your account, notify you about changes, and provide AI-driven travel recommendations. 
            </p>

            <h4 className="text-warning mt-4 mb-3">3. Data Security</h4>
            <p>
              We prioritize the security of your data using industry-standard hashing algorithms for authentication (e.g., bcrypt for passwords and SHA-256 for email verification codes). However, remember that no method of transmission over the Internet is 100% secure.
            </p>

          </div>

          <div className="mt-5 pt-4 border-top border-secondary border-opacity-20">
            <Link to="/" className="btn btn-outline-warning rounded-pill px-4">Return Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
