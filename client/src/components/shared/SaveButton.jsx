import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { saveTrip, unsaveTrip } from "../../services/tripSave.api";

function SaveButton({ tripId, initialSaved = false, initialCount = 0, onToggle }) {
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to save trips! ✈️");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        // UNSAVE
        await unsaveTrip(tripId);
        setSaved(false);
        const newCount = Math.max(0, count - 1);
        setCount(newCount);
        toast.success("Removed from Saved Trips! 🎒");
        if (onToggle) onToggle(false, newCount);
      } else {
        // SAVE
        await saveTrip(tripId);
        setSaved(true);
        const newCount = count + 1;
        setCount(newCount);
        toast.success("Saved to your Saved Trips! ⭐");
        if (onToggle) onToggle(true, newCount);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to update save status.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveToggle}
      disabled={loading}
      className={`btn ${saved ? "btn-warning text-dark" : "btn-outline-light"}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        borderRadius: "20px",
        padding: "6px 14px",
        fontSize: "13.5px",
        fontWeight: "600",
        transition: "all 0.25s ease",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: saved ? "0 0 15px rgba(255, 193, 7, 0.35)" : "none",
      }}
      title={saved ? "Unsave Trip" : "Save Trip"}
    >
      <span style={{ fontSize: "15px" }}>{saved ? "★" : "☆"}</span>
      <span>{saved ? "Saved" : "Save"}</span>
      {count > 0 && (
        <span
          className="badge bg-dark text-light rounded-pill ms-1"
          style={{ fontSize: "10px", padding: "3px 6px" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default SaveButton;
