import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

function FriendCard({
  user,
  variant = "friend",
  matchScore,
  onAccept,
  onReject,
  onCancel,
  onRemove,
  onFollowToggle,
  onSendRequest,
  isFollowing,
  requestStatus = "pending",
  loadingAction = false,
}) {
  if (!user) return null;

  // Curated color palettes
  const getMatchScoreColor = (score) => {
    if (score >= 80) return "#2ec4b6"; // Teal
    if (score >= 50) return "#ff9f1c"; // Amber
    return "#e71d36"; // Crimson
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const score = user.trustScore ?? 10;
  const match = matchScore ?? user.matchScore ?? 0;

  return (
    <div
      className="glass-card p-4 d-flex flex-column justify-content-between h-100 transition-all hover-lift"
      style={{
        background: "rgba(25, 25, 25, 0.65)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        marginBottom: "20px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Top Banner Accent */}
      <div
        style={{
          height: "4px",
          margin: "-24px -24px 18px -24px",
          background: `linear-gradient(90deg, ${getMatchScoreColor(match)}, #ffb703)`,
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          opacity: 0.85,
        }}
      />

      {/* Body Content */}
      <div>
        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap flex-sm-nowrap">
          <Avatar
            src={user.profileImage}
            alt={user.name}
            size={64}
            className="border border-2 border-warning shadow-sm"
          />

          <div className="overflow-hidden w-100">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h5 className="mb-0 fw-bold text-white text-truncate" style={{ fontSize: "1.1rem" }}>
                {user.name}
              </h5>
              {user.isVerified && (
                <span
                  className="badge bg-success d-inline-flex align-items-center justify-content-center"
                  style={{ fontSize: "10px", padding: "3px 6px", borderRadius: "10px" }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-secondary mb-0 text-truncate" style={{ fontSize: "13px" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Badges Info Row */}
        <div className="d-flex gap-2 flex-wrap mb-3">
          {user.travelStyle && (
            <span
              className="badge text-dark fw-bold d-flex align-items-center"
              style={{ background: "#ffb703", fontSize: "11px", padding: "4px 8px" }}
            >
              🎒 {user.travelStyle}
            </span>
          )}
          {user.destinationPreference && (
            <span
              className="badge bg-dark border border-secondary text-secondary d-flex align-items-center"
              style={{ fontSize: "11px", padding: "4px 8px" }}
            >
              📍 {user.destinationPreference}
            </span>
          )}
        </div>

        {/* Interests Section */}
        {user.interests && user.interests.length > 0 && (
          <div className="mb-3">
            <small className="text-secondary d-block mb-1" style={{ fontSize: "11px", fontWeight: "600" }}>
              INTERESTS
            </small>
            <div className="d-flex flex-wrap gap-1">
              {user.interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="badge bg-secondary text-light fw-normal"
                  style={{
                    fontSize: "10.5px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    padding: "3px 6px"
                  }}
                >
                  {interest}
                </span>
              ))}
              {user.interests.length > 3 && (
                <span
                  className="badge bg-secondary text-secondary fw-normal"
                  style={{ fontSize: "10.5px", background: "transparent", padding: "3px 6px" }}
                >
                  +{user.interests.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Variant-specific metrics */}
        <div
          className="p-3 rounded mb-3"
          style={{ background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255, 255, 255, 0.03)" }}
        >
          <div className="row g-2 align-items-center">
            {/* MATCH SCORE */}
            {(variant === "friend" || variant === "received-request" || variant === "suggestion") && (
              <div className="col-6 border-end border-secondary" style={{ borderColor: "rgba(255, 255, 255, 0.1) !important" }}>
                <small className="text-secondary d-block" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                  Match Score
                </small>
                <span
                  className="fw-bold"
                  style={{ color: getMatchScoreColor(match), fontSize: "15px" }}
                >
                  🔥 {match}%
                </span>
              </div>
            )}

            {/* TRUST SCORE */}
            {(variant === "friend" || variant === "suggestion") && (
              <div className="col-6 ps-3">
                <small className="text-secondary d-block" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                  Trust Score
                </small>
                <span className={`fw-bold ${getTrustScoreColor(score)}`} style={{ fontSize: "15px" }}>
                  🛡️ {score}/100
                </span>
              </div>
            )}

            {/* REQUEST STATUS */}
            {variant === "sent-request" && (
              <div className="col-12">
                <small className="text-secondary d-block" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                  Request Status
                </small>
                <span className="badge bg-warning text-dark fw-bold mt-1" style={{ fontSize: "11px" }}>
                  ⏳ {requestStatus.toUpperCase()}
                </span>
              </div>
            )}

            {/* RECEIVED REQUEST DETAILS */}
            {variant === "received-request" && (
              <div className="col-6 ps-3">
                <small className="text-secondary d-block" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                  Trust Score
                </small>
                <span className={`fw-bold ${getTrustScoreColor(score)}`} style={{ fontSize: "15px" }}>
                  🛡️ {score}/100
                </span>
              </div>
            )}
          </div>

          {/* Social Stats Row (For Friends & Suggestions) */}
          {(variant === "friend" || variant === "suggestion") && (
            <div className="row g-2 mt-2 pt-2 border-top border-secondary" style={{ borderColor: "rgba(255, 255, 255, 0.05) !important" }}>
              <div className="col-6 text-center">
                <small className="text-secondary d-block" style={{ fontSize: "10px" }}>Followers</small>
                <span className="fw-semibold text-white" style={{ fontSize: "13px" }}>
                  {user.followersCount ?? user.followers?.length ?? 0}
                </span>
              </div>
              <div className="col-6 text-center">
                <small className="text-secondary d-block" style={{ fontSize: "10px" }}>Following</small>
                <span className="fw-semibold text-white" style={{ fontSize: "13px" }}>
                  {user.followingCount ?? user.following?.length ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reusable Action Buttons Footer */}
      <div className="d-flex gap-2 flex-wrap mt-auto">
        {/* VIEW PROFILE (All variants) */}
        <Link
          to={`/profile/${user._id}`}
          className="btn btn-sm btn-outline-light flex-grow-1 py-2 fw-semibold d-flex align-items-center justify-content-center"
          style={{ fontSize: "13px", borderRadius: "8px" }}
        >
          View Profile
        </Link>

        {/* FRIEND ACTION BUTTONS */}
        {variant === "friend" && (
          <>
            <Link
              to="/chat"
              className="btn btn-sm btn-warning py-2 fw-semibold d-flex align-items-center justify-content-center"
              style={{ fontSize: "13px", borderRadius: "8px", flexGrow: 1 }}
            >
              💬 Message
            </Link>
            <button
              onClick={onRemove}
              disabled={loadingAction}
              className="btn btn-sm btn-outline-danger py-2 fw-semibold"
              style={{ fontSize: "13px", borderRadius: "8px" }}
              title="Remove Friend"
            >
              Unfriend
            </button>
          </>
        )}

        {/* SENT REQUEST BUTTONS */}
        {variant === "sent-request" && (
          <button
            onClick={onCancel}
            disabled={loadingAction}
            className="btn btn-sm btn-danger py-2 fw-semibold flex-grow-1"
            style={{ fontSize: "13px", borderRadius: "8px" }}
          >
            Cancel Request
          </button>
        )}

        {/* RECEIVED REQUEST BUTTONS */}
        {variant === "received-request" && (
          <div className="d-flex gap-1 w-100 mt-2">
            <button
              onClick={onAccept}
              disabled={loadingAction}
              className="btn btn-sm btn-success py-2 fw-semibold flex-grow-1"
              style={{ fontSize: "13px", borderRadius: "8px" }}
            >
              Accept
            </button>
            <button
              onClick={onReject}
              disabled={loadingAction}
              className="btn btn-sm btn-danger py-2 fw-semibold flex-grow-1"
              style={{ fontSize: "13px", borderRadius: "8px" }}
            >
              Reject
            </button>
          </div>
        )}

        {/* SUGGESTION BUTTONS */}
        {variant === "suggestion" && (
          <div className="d-flex gap-1 w-100 mt-2">
            <button
              onClick={onFollowToggle}
              disabled={loadingAction}
              className={`btn btn-sm ${isFollowing ? "btn-outline-warning" : "btn-warning"} fw-semibold flex-grow-1`}
              style={{ fontSize: "13px", borderRadius: "8px" }}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={onSendRequest}
              disabled={loadingAction}
              className="btn btn-sm btn-outline-warning fw-semibold flex-grow-1"
              style={{ fontSize: "13px", borderRadius: "8px" }}
            >
              Connect 🤝
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendCard;