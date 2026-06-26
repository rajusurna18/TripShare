import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Avatar from "../shared/Avatar";
import SaveButton from "../shared/SaveButton";
import ShareButton from "../shared/ShareButton";
import API from "../../services/api";

function ActivityCard({ activity }) {
  const { actor, type, tripId, metadata, createdAt } = activity;
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      const targetId = tripId?._id || tripId;
      if (!targetId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      if (window.savedTripIds) {
        setIsSaved(window.savedTripIds.has(targetId.toString()));
      } else {
        try {
          const res = await API.get("/saves");
          const ids = new Set((res.data.saves || []).map((s) => s.trip?._id).filter(Boolean));
          window.savedTripIds = ids;
          setIsSaved(ids.has(targetId.toString()));
        } catch (err) {
          console.error("Error checking saved status in ActivityCard:", err);
        }
      }
    };
    checkSavedStatus();
  }, [tripId]);

  // Format time nicely
  const timeStr = new Date(createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Action text mapping
  const getActionText = () => {
    switch (type) {
      case "TRIP_CREATED":
        return "created a new travel trip ✈️";
      case "TRIP_JOINED":
        return "joined a travel trip 🎒";
      case "TRIP_SAVED":
        return "bookmarked an adventure to their saved list ⭐";
      case "TRIP_SHARED":
        return `shared a trip on ${metadata?.platform || "socials"} 🔗`;
      case "MEMORY_UPLOADED":
        return "shared a new trip memory 📸";
      case "REVIEW_ADDED":
        return `reviewed ${metadata?.reviewedUserName || "a traveler"}'s profile ⭐`;
      case "BLOG_POSTED":
        return "published a travel blog post 📝";
      default:
        return "shared an update 🔔";
    }
  };

  // Card Content Render Factory
  const renderCardContent = () => {
    const API_ASSET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

    switch (type) {
      case "TRIP_CREATED":
      case "TRIP_JOINED":
      case "TRIP_SAVED":
      case "TRIP_SHARED":
        const actualTripId = tripId?._id || tripId;
        return (
          <div className="mt-3 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <h5 className="fw-bold text-warning mb-2">{metadata?.title || "Upcoming Adventure"}</h5>
            <p className="text-light mb-2" style={{ fontSize: "14px" }}>
              📍 <b>Destination</b>: {metadata?.destination || "Unknown"}
            </p>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top border-secondary border-opacity-10">
              {metadata?.startDate && (
                <span className="text-secondary" style={{ fontSize: "12px" }}>
                  📅 {new Date(metadata.startDate).toLocaleDateString()} - {metadata.endDate ? new Date(metadata.endDate).toLocaleDateString() : ""}
                </span>
              )}
              <div className="d-flex gap-2 align-items-center mt-2 mt-sm-0">
                {actualTripId && (
                  <>
                    <SaveButton
                      tripId={actualTripId}
                      initialSaved={isSaved}
                      initialCount={tripId?.savesCount || 0}
                      onToggle={(savedState) => {
                        setIsSaved(savedState);
                        if (window.savedTripIds) {
                          if (savedState) {
                            window.savedTripIds.add(actualTripId.toString());
                          } else {
                            window.savedTripIds.delete(actualTripId.toString());
                          }
                        }
                      }}
                    />
                    <ShareButton
                      tripId={actualTripId}
                      tripTitle={metadata?.title}
                      tripDestination={metadata?.destination}
                      initialCount={tripId?.sharesCount || 0}
                    />
                    <Link to={`/trip/${actualTripId}`} className="btn btn-outline-warning btn-sm fw-bold px-3 py-2" style={{ borderRadius: "20px" }}>
                      View Details
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "MEMORY_UPLOADED":
        const imgSrc = metadata?.imageUrl?.startsWith("http") ? metadata.imageUrl : `${API_ASSET_URL}/${metadata?.imageUrl}`;
        return (
          <div className="mt-3">
            {metadata?.caption && (
              <p className="text-light mb-3" style={{ fontSize: "14.5px", fontStyle: "italic" }}>
                "{metadata.caption}"
              </p>
            )}
            {metadata?.imageUrl && (
              <div className="position-relative overflow-hidden rounded border border-secondary" style={{ maxHeight: "350px", background: "#050505" }}>
                <img
                  src={imgSrc}
                  alt="Memory Attachment"
                  className="w-100 object-fit-cover"
                  style={{ maxHeight: "350px", opacity: 0.9, transition: "all 0.3s ease" }}
                />
                {metadata?.tripTitle && (
                  <span className="position-absolute bottom-0 start-0 bg-dark text-warning px-3 py-1 rounded-end fw-semibold" style={{ fontSize: "12px", background: "rgba(0,0,0,0.8)" }}>
                    ✈️ {metadata.tripTitle}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case "REVIEW_ADDED":
        return (
          <div className="mt-3 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div className="d-flex align-items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < (metadata?.rating || 5) ? "text-warning" : "text-muted"} style={{ fontSize: "16px" }}>
                  ★
                </span>
              ))}
            </div>
            {metadata?.comment && (
              <p className="text-light mb-0" style={{ fontSize: "14px" }}>
                "{metadata.comment}"
              </p>
            )}
            <div className="mt-2 text-end">
              <Link to={`/profile/${metadata?.reviewedUserId}`} className="text-warning text-decoration-none hover-warning" style={{ fontSize: "12.5px" }}>
                View {metadata?.reviewedUserName}'s Profile 👤
              </Link>
            </div>
          </div>
        );

      case "BLOG_POSTED":
        return (
          <div className="mt-3 p-3 rounded" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <h5 className="fw-bold text-info mb-2">{metadata?.title || "Travel Story"}</h5>
            <p className="text-secondary mb-3" style={{ fontSize: "13.5px" }}>
              {metadata?.excerpt || "Read my latest travel thoughts and journal logs."}
            </p>
            <div className="text-end">
              <Link to={`/blog/${activity.entityId}`} className="btn btn-outline-info btn-sm px-3" style={{ borderRadius: "8px" }}>
                Read Article
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="glass-card p-4 transition-all hover-lift"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "transform 0.2s ease, background 0.2s ease",
      }}
    >
      <div className="d-flex align-items-center gap-3 mb-2">
        <Link to={`/profile/${actor?._id}`}>
          <Avatar src={actor?.profileImage} size={46} className="border border-secondary shadow-sm" />
        </Link>
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Link to={`/profile/${actor?._id}`} className="text-white fw-bold text-decoration-none hover-warning text-hover-underline" style={{ fontSize: "15px" }}>
              {actor?.name || "Traveler"}
            </Link>
            {actor?.isVerified && (
              <span className="text-warning" title="Verified Traveler" style={{ fontSize: "14px" }}>
                🛡️
              </span>
            )}
            <span className="text-secondary" style={{ fontSize: "14px" }}>
              {getActionText()}
            </span>
          </div>
          <small className="text-secondary" style={{ fontSize: "11.5px" }}>
            {timeStr}
          </small>
        </div>
      </div>

      {renderCardContent()}
    </div>
  );
}

export default ActivityCard;
