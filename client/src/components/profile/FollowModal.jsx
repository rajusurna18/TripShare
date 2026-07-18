import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../shared/Avatar";

export function FollowModal({ isOpen, onClose, title, users = [] }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          background: "#1e1e1e",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <h4 className="m-0 fw-bold text-warning">{title}</h4>
          <button
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* LIST CONTAINER */}
        <div
          className="p-3"
          style={{
            overflowY: "auto",
            flex: 1,
          }}
        >
          {users.length === 0 ? (
            <div className="text-center text-secondary py-5">
              <h5>No travelers found</h5>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {users.map((item) => (
                <div
                  key={item._id}
                  className="d-flex align-items-center justify-content-between p-2 rounded"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Avatar src={item.profileImage} size={44} />
                    <div>
                      <Link
                        to={`/profile/${item._id}`}
                        className="m-0 fw-bold text-white text-decoration-none"
                        onClick={onClose}
                        style={{ fontSize: "15px" }}
                      >
                        {item.name}
                      </Link>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        {item.travelStyle && (
                          <span
                            className="badge bg-secondary"
                            style={{ fontSize: "10px", fontWeight: "normal" }}
                          >
                            {item.travelStyle}
                          </span>
                        )}
                        <span
                          className="badge bg-warning text-dark"
                          style={{ fontSize: "10px" }}
                        >
                          ⭐ {item.stats?.trustScore || 10}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/profile/${item._id}`}
                    className="btn btn-warning btn-sm fw-semibold"
                    onClick={onClose}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowModal;
