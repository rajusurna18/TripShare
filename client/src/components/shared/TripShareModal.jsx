import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { shareTrip } from "../../services/tripSave.api";

function TripShareModal({ tripId, tripTitle, tripDestination, isOpen, onClose, onShareSuccess }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tripUrl = `${window.location.origin}/trip/${tripId}`;
  const shareText = `Check out this amazing trip to ${tripDestination || "our destination"} on TripShare AI: ${tripTitle || "Adventure"} ✈️ Let's travel together! Link: ${tripUrl}`;

  const logShare = async (platform) => {
    try {
      await shareTrip(tripId, platform);
      if (onShareSuccess) {
        onShareSuccess(platform);
      }
    } catch (err) {
      console.error("Failed to log share event:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      toast.success("Trip link copied to clipboard! 📋");
      logShare("copy_link");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleWhatsAppShare = () => {
    logShare("whatsapp");
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  const handleInstagramShare = () => {
    logShare("instagram");
    navigator.clipboard.writeText(tripUrl);
    toast.success("Trip link copied! Post on your Instagram Bio or Story 📸");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1100,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(145deg, rgba(20, 20, 35, 0.9) 0%, rgba(10, 10, 18, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          animation: "fadeUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-warning m-0 fw-bold" style={{ fontSize: "22px" }}>
            ✨ Share Trip Adventure
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              fontSize: "24px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.color = "#ffc107")}
            onMouseOut={(e) => (e.target.style.color = "#aaa")}
          >
            &times;
          </button>
        </div>

        <p className="text-secondary small mb-4">
          Spread the word! Invite your friends or group members to join the trip to <b>{tripDestination}</b>.
        </p>

        {/* SOCIAL LIST */}
        <div className="d-flex flex-column gap-3 mb-4">
          {/* WHATSAPP */}
          <button
            className="btn btn-success d-flex align-items-center justify-content-center gap-3 py-3 fw-bold rounded-pill text-white"
            onClick={handleWhatsAppShare}
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              border: "none",
              boxShadow: "0 4px 15px rgba(37, 211, 102, 0.2)",
            }}
          >
            <i className="fab fa-whatsapp style-icon" style={{ fontSize: "20px" }}></i>
            Share on WhatsApp
          </button>

          {/* INSTAGRAM */}
          <button
            className="btn d-flex align-items-center justify-content-center gap-3 py-3 fw-bold rounded-pill text-white"
            onClick={handleInstagramShare}
            style={{
              background: "linear-gradient(135deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)",
              border: "none",
              boxShadow: "0 4px 15px rgba(220, 39, 67, 0.2)",
            }}
          >
            <i className="fab fa-instagram style-icon" style={{ fontSize: "20px" }}></i>
            Copy Link for Instagram Story
          </button>

          {/* COPY LINK */}
          <button
            className="btn btn-outline-light d-flex align-items-center justify-content-center gap-3 py-3 fw-bold rounded-pill"
            onClick={handleCopyLink}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.08)";
              e.target.style.borderColor = "#ffc107";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.03)";
              e.target.style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >
            <i className="fas fa-link style-icon" style={{ fontSize: "16px" }}></i>
            {copied ? "Link Copied! 👍" : "Copy Shared Link"}
          </button>
        </div>

        {/* TRIP INFO PREVIEW */}
        <div
          className="p-3 rounded"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ fontSize: "13px" }}>🔗</span>
            <small className="text-secondary text-truncate" style={{ fontSize: "12px", maxWidth: "380px" }}>
              {tripUrl}
            </small>
          </div>
          <small className="text-muted block text-center mt-2 d-block">
            Instagram tip: Tap bio link or add a Link sticker on stories!
          </small>
        </div>
      </div>
    </div>
  );
}

export default TripShareModal;
