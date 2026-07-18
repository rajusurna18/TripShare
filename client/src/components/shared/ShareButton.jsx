import React, { useState, useEffect } from "react";
import TripShareModal from "./TripShareModal";

function ShareButton({ tripId, tripTitle, tripDestination, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const handleShareLogged = (platform) => {
    setCount((prev) => prev + 1);
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        className="btn btn-outline-info"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          borderRadius: "20px",
          padding: "6px 14px",
          fontSize: "13.5px",
          fontWeight: "600",
          color: "#0dcaf0",
          borderColor: "rgba(13, 202, 240, 0.3)",
          background: "rgba(13, 202, 240, 0.03)",
          transition: "all 0.25s ease",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          e.target.style.background = "rgba(13, 202, 240, 0.1)";
          e.target.style.borderColor = "#0dcaf0";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "rgba(13, 202, 240, 0.03)";
          e.target.style.borderColor = "rgba(13, 202, 240, 0.3)";
        }}
      >
        <span style={{ fontSize: "14px" }}>🔗</span>
        <span>Share</span>
        {count > 0 && (
          <span
            className="badge bg-dark text-info rounded-pill ms-1"
            style={{ fontSize: "10px", padding: "3px 6px" }}
          >
            {count}
          </span>
        )}
      </button>

      <TripShareModal
        tripId={tripId}
        tripTitle={tripTitle}
        tripDestination={tripDestination}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onShareSuccess={handleShareLogged}
      />
    </>
  );
}

export default ShareButton;
