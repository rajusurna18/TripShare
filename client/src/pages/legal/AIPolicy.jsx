import React from "react";
import { Link } from "react-router-dom";

const AIPolicy = () => {
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
          
          <h1 className="fw-bold text-warning mb-2">TripShare AI Usage Policy</h1>
          <p className="text-secondary mb-4 small">Last Updated: [Informational Placeholder]</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            <p>
              TripShare utilizes artificial intelligence to enhance your travel planning and expense management. Please understand the capabilities and limitations of these tools.
            </p>

            <h4 className="text-warning mt-4 mb-3">1. Nature of AI Recommendations</h4>
            <p>
              TripShare AI is powered by large language models. The itineraries, packing lists, and destination facts generated are predictions based on available training data. They may contain inaccuracies or "hallucinations." 
            </p>

            <h4 className="text-warning mt-4 mb-3">2. Not Professional Advice</h4>
            <p>
              AI-generated content does NOT constitute binding legal, financial, or medical advice. Always consult official embassy websites for visa requirements, official transit authorities for schedules, and licensed medical professionals for travel vaccinations.
            </p>

            <h4 className="text-warning mt-4 mb-3">3. Data Privacy in AI Chats</h4>
            <p>
              Your conversations with the AI Buddy are stored securely to provide contextual memory across sessions. You can delete individual chat sessions at any time from your AI dashboard. Do not input highly sensitive information (like credit card numbers or passwords) into the AI chat interface.
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

export default AIPolicy;
