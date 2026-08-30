import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, PlusCircle, Lock, ArrowLeft, UserPlus, CheckCircle2, Loader2 } from "lucide-react";
import API from "../../services/api";
import toast from "react-hot-toast";

function GroupChatLockedModal({ mode = "no_trips", tripId, onClose }) {
  const navigate = useNavigate();
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendJoinRequest = async () => {
    if (!tripId || requestLoading || requestSent) return;

    try {
      setRequestLoading(true);
      const token = localStorage.getItem("token");
      await API.post(
        `/join-requests/${tripId}`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      toast.success("Join request sent successfully! ✈️");
      setRequestSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send join request";
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already sent")) {
        toast.error("You have already sent a join request for this trip");
        setRequestSent(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const isNotMember = mode === "not_member";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: "rgba(10, 10, 15, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 1060,
      }}
    >
      <div
        className="bg-dark text-light rounded-4 border border-secondary border-opacity-30 shadow-lg p-4 text-center d-flex flex-column align-items-center w-100 animate-fade-in"
        style={{
          maxWidth: "440px",
          background: "linear-gradient(145deg, #121319 0%, #1a1b26 100%)",
        }}
      >
        {/* ICON */}
        <div
          className="p-3 rounded-circle bg-warning bg-opacity-15 text-warning mb-3 d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: "64px", height: "64px" }}
        >
          <Lock size={32} />
        </div>

        {/* TITLE */}
        <h4 className="fw-bold text-white mb-2" style={{ fontSize: "20px", letterSpacing: "0.3px" }}>
          {isNotMember ? "Trip Group Access Required" : "Group Chat Access"}
        </h4>

        {/* MESSAGE */}
        <p className="text-secondary small mb-4" style={{ fontSize: "14px", lineHeight: "1.5" }}>
          {isNotMember
            ? "You're not part of this trip group. Please request to join the trip before accessing Group Chat."
            : "You're not part of any trip group yet. Please join a trip to access Group Chat."}
        </p>

        {/* ACTION BUTTONS */}
        <div className="d-flex flex-column gap-2.5 w-100 mb-2">
          {isNotMember ? (
            <>
              <button
                className="btn btn-warning fw-bold py-2.5 px-4 rounded-3 text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all active:scale-95"
                onClick={handleSendJoinRequest}
                disabled={requestLoading || requestSent}
                style={{ fontSize: "14px" }}
              >
                {requestLoading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Sending Request...</span>
                  </>
                ) : requestSent ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Request Sent ⏳</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Request to Join</span>
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-warning fw-semibold py-2.5 px-4 rounded-3 text-warning d-flex align-items-center justify-content-center gap-2 transition-all active:scale-95"
                onClick={() => navigate("/trips")}
                style={{ fontSize: "14px" }}
              >
                <Compass size={18} />
                <span>Back to Trips</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-warning fw-bold py-2.5 px-4 rounded-3 text-dark d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all active:scale-95"
                onClick={() => navigate("/discover")}
                style={{ fontSize: "14px" }}
              >
                <Compass size={18} />
                <span>Find a Trip</span>
              </button>

              <button
                className="btn btn-outline-warning fw-semibold py-2.5 px-4 rounded-3 text-warning d-flex align-items-center justify-content-center gap-2 transition-all active:scale-95"
                onClick={() => navigate("/create-trip")}
                style={{ fontSize: "14px" }}
              >
                <PlusCircle size={18} />
                <span>Create a Trip</span>
              </button>
            </>
          )}
        </div>

        {/* SECONDARY CANCEL / BACK */}
        {onClose ? (
          <button
            className="btn btn-link text-secondary text-decoration-none small mt-2 p-0"
            onClick={onClose}
            style={{ fontSize: "12px" }}
          >
            <ArrowLeft size={13} className="me-1" />
            Cancel
          </button>
        ) : (
          <button
            className="btn btn-link text-secondary text-decoration-none small mt-2 p-0"
            onClick={() => navigate(-1)}
            style={{ fontSize: "12px" }}
          >
            <ArrowLeft size={13} className="me-1" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default GroupChatLockedModal;
