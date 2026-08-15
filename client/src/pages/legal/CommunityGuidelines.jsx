import React from "react";
import { Link } from "react-router-dom";

const CommunityGuidelines = () => {
  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5 rounded-4 border border-secondary border-opacity-20" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>
          
          <h1 className="fw-bold text-warning mb-2">Community Guidelines</h1>
          <p className="text-secondary mb-4 small">Last Updated: [Informational Placeholder]</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            <p>
              TripShare is built on trust, respect, and a shared love for exploration. Please follow these guidelines to keep the platform safe and enjoyable for everyone.
            </p>

            <h4 className="text-warning mt-4 mb-3">1. Respect Fellow Travelers</h4>
            <p>
              Harassment, hate speech, bullying, and discrimination of any kind will not be tolerated. Treat others in reviews and chats with respect.
            </p>

            <h4 className="text-warning mt-4 mb-3">2. No Spam or Fraud</h4>
            <p>
              Do not use TripShare to distribute spam, solicit fake reviews, or execute scams. Financial transactions (via the Expense splitter) should only be conducted with travelers you trust.
            </p>

            <h4 className="text-warning mt-4 mb-3">3. Authentic Content</h4>
            <p>
              Please share authentic reviews, memories, and photos. Do not impersonate others or create fake accounts.
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

export default CommunityGuidelines;
