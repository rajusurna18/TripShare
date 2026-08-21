import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../shared/Avatar";
import API from "../../services/api";
import toast from "react-hot-toast";

function NotificationCard({
  notification,
  onRead,
  onDelete,
}) {
  const [requestStatus, setRequestStatus] = useState(null); // 'accepted', 'rejected'
  const [actionLoading, setActionLoading] = useState(false);

  const isJoinRequest = notification.type === "join_request" && notification.link?.startsWith("/join-requests/");
  const tripId = isJoinRequest ? notification.link.split("/join-requests/")[1] : null;

  const handleAcceptRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setActionLoading(true);
      // Fetch pending requests for this trip to match sender or handle directly
      if (tripId) {
        const res = await API.get(`/join-requests/${tripId}`);
        const requests = res.data.requests || [];
        const match = requests.find(r => r.user?._id === notification.sender?._id || r.user === notification.sender?._id);
        if (match) {
          await API.put(`/join-requests/accept/${match._id}`);
          setRequestStatus("accepted");
          toast.success("Join request accepted! 🎉");
          if (onRead) onRead(notification._id);
          return;
        }
      }
      toast.success("Opening join requests...");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setActionLoading(true);
      if (tripId) {
        const res = await API.get(`/join-requests/${tripId}`);
        const requests = res.data.requests || [];
        const match = requests.find(r => r.user?._id === notification.sender?._id || r.user === notification.sender?._id);
        if (match) {
          await API.put(`/join-requests/reject/${match._id}`);
          setRequestStatus("rejected");
          toast.success("Join request declined.");
          if (onRead) onRead(notification._id);
          return;
        }
      }
      toast.error("Failed to find request");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case "FRIEND":
        return "🤝";
      case "TRIP":
        return "✈️";
      case "CHAT":
        return "💬";
      case "MEMORY":
        return "❤️";
      case "REVIEW":
        return "⭐";
      case "SYSTEM":
      default:
        return "🔔";
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category?.toUpperCase()) {
      case "FRIEND":
        return "bg-info text-dark";
      case "TRIP":
        return "bg-success text-white";
      case "CHAT":
        return "bg-primary text-white";
      case "MEMORY":
        return "bg-danger text-white";
      case "REVIEW":
        return "bg-warning text-dark";
      case "SYSTEM":
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div
      className={`glass-card p-4 transition-all hover-lift ${
        !notification.read
          ? "border-start border-4 border-warning"
          : "opacity-75"
      }`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
        
        {/* Left Side: Category Icon + Avatar + Notification Info */}
        <div className="d-flex align-items-start gap-3 flex-grow-1">
          {/* Category Icon Badge */}
          <div 
            className="d-flex align-items-center justify-content-center bg-dark rounded-circle" 
            style={{ width: "36px", height: "36px", border: "1px solid rgba(255, 255, 255, 0.1)", fontSize: "18px" }}
            title={notification.category}
          >
            {getCategoryIcon(notification.category)}
          </div>

          <Avatar src={notification.sender?.profileImage} size={48} className="border border-secondary shadow-sm" />
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              {/* Category label badge */}
              <span className={`badge rounded-pill ${getCategoryBadgeClass(notification.category)}`} style={{ fontSize: "10px", fontWeight: "600" }}>
                {notification.category || "SYSTEM"}
              </span>
              
              {!notification.read && (
                <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "9px", fontWeight: "700" }}>
                  NEW
                </span>
              )}
            </div>

            {/* Notification message - wrap in link if present */}
            <h6 className="mb-2 fw-semibold text-white">
              {notification.link ? (
                <Link to={notification.link} className="text-decoration-none text-light hover-warning text-hover-underline">
                  {notification.message}
                </Link>
              ) : (
                <span>{notification.message}</span>
              )}
            </h6>

            {/* INLINE JOIN REQUEST ACTIONS */}
            {isJoinRequest && !requestStatus && (
              <div className="d-flex gap-2 my-2">
                <button
                  className="btn btn-success btn-sm fw-bold px-3"
                  onClick={handleAcceptRequest}
                  disabled={actionLoading}
                  style={{ borderRadius: "6px", fontSize: "11px" }}
                >
                  Accept ✅
                </button>
                <button
                  className="btn btn-outline-danger btn-sm fw-bold px-3"
                  onClick={handleRejectRequest}
                  disabled={actionLoading}
                  style={{ borderRadius: "6px", fontSize: "11px" }}
                >
                  Reject ❌
                </button>
              </div>
            )}

            {requestStatus === "accepted" && (
              <span className="badge bg-success text-white my-1" style={{ fontSize: "11px" }}>
                Request Accepted ✅
              </span>
            )}
            {requestStatus === "rejected" && (
              <span className="badge bg-danger text-white my-1" style={{ fontSize: "11px" }}>
                Request Declined ❌
              </span>
            )}

            <small className="text-secondary d-block">
              {new Date(notification.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </small>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="d-flex flex-wrap align-items-center gap-2 ms-auto ms-md-0 mt-2 mt-md-0">
          {!notification.read && (
            <button
              className="btn btn-warning btn-sm fw-bold px-3 btn-responsive"
              onClick={() => onRead(notification._id)}
              style={{ borderRadius: "8px", fontSize: "12px" }}
            >
              Mark Read
            </button>
          )}

          <button
            className="btn btn-outline-danger btn-sm px-2 btn-responsive"
            onClick={() => onDelete(notification._id)}
            title="Delete Notification"
            style={{ borderRadius: "8px", fontSize: "12px", border: "1px solid rgba(220, 53, 69, 0.3)" }}
          >
            🗑️
          </button>
        </div>

      </div>
    </div>
  );
}

export default NotificationCard;