import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import FriendCard from "../components/shared/FriendCard";
import toast, { Toaster } from "react-hot-toast";

function Friends() {
  const [activeTab, setActiveTab] = useState("friends"); // friends, sent, received, suggestions
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [limit] = useState(8); // Show 8 items per page

  // Current logged in user (to check self or display context)
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Centralized search query debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1); // Reset page on search change
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch page items based on active tab and query
  const fetchTabItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        query: debouncedQuery,
        page: currentPage,
        limit,
      };

      let endpoint = "/friends";
      if (activeTab === "sent") {
        endpoint = "/friends/sent-requests";
      } else if (activeTab === "received") {
        endpoint = "/friends/requests";
      } else if (activeTab === "suggestions") {
        endpoint = "/friends/suggestions";
      }

      const res = await API.get(endpoint, { params });
      
      if (activeTab === "friends") {
        setItems(res.data.friends || []);
      } else if (activeTab === "sent" || activeTab === "received") {
        setItems(res.data.requests || []);
      } else if (activeTab === "suggestions") {
        setItems(res.data.travelers || []);
      }

      setTotalPages(res.data.totalPages || 1);
      setTotalResults(res.data.totalResults || 0);
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
      toast.error(err.response?.data?.message || "Failed to load travelers list");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedQuery, currentPage, limit]);

  // Trigger fetch on tab, page or debounced search change
  useEffect(() => {
    fetchTabItems();
  }, [fetchTabItems]);

  // Tab switch handler
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setQuery(""); // Clear search query when changing tabs
    setDebouncedQuery("");
    setCurrentPage(1);
  };

  // Actions trigger:
  // Accept request
  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(true);
      await API.put(`/friends/accept/${requestId}`);
      toast.success("Friend request accepted! 🎉");
      fetchTabItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject request
  const handleRejectRequest = async (requestId) => {
    try {
      setActionLoading(true);
      await API.put(`/friends/reject/${requestId}`);
      toast.success("Request rejected.");
      fetchTabItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel request
  const handleCancelRequest = async (requestId) => {
    try {
      setActionLoading(true);
      await API.delete(`/friends/cancel/${requestId}`);
      toast.success("Friend request cancelled.");
      fetchTabItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove friend (Unfriend)
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      setActionLoading(true);
      await API.delete(`/friends/remove/${friendId}`);
      toast.success("Friend removed successfully.");
      fetchTabItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove friend");
    } finally {
      setActionLoading(false);
    }
  };

  // Connect (Send Friend Request)
  const handleSendRequest = async (targetUserId) => {
    try {
      setActionLoading(true);
      await API.post("/friends/send", { receiver: targetUserId });
      toast.success("Friend request sent! 🤝");
      fetchTabItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  // Follow / Unfollow user
  const handleFollowToggle = async (targetUserId, currentFollowing) => {
    try {
      setActionLoading(true);
      const endpoint = currentFollowing
        ? `/profile/unfollow/${targetUserId}`
        : `/profile/follow/${targetUserId}`;
      await API.post(endpoint);
      toast.success(currentFollowing ? "Unfollowed traveler" : "Started following traveler! 👤");
      // Update local items state for instant visual response
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === targetUserId) {
            const currentCount = item.followersCount || 0;
            return {
              ...item,
              isFollowing: !currentFollowing,
              followersCount: currentFollowing ? Math.max(0, currentCount - 1) : currentCount + 1,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Clear search wrapper
  const handleClearSearch = () => {
    setQuery("");
  };

  // Rendering Helper for Pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-4 pb-5">
        <button
          className="btn btn-outline-warning btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-1"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || loading}
          style={{ borderRadius: "8px" }}
        >
          ◀ Prev
        </button>

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            disabled={loading}
            className={`btn btn-sm px-3 py-2 fw-bold ${
              currentPage === pageNum
                ? "btn-warning text-dark"
                : "btn-outline-secondary text-light"
            }`}
            style={{ minWidth: "40px", borderRadius: "8px" }}
          >
            {pageNum}
          </button>
        ))}

        <button
          className="btn btn-outline-warning btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-1"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || loading}
          style={{ borderRadius: "8px" }}
        >
          Next ▶
        </button>
      </div>
    );
  };

  // Empty State layouts
  const renderEmptyState = () => {
    if (query) {
      return (
        <div className="glass-card text-center py-5 px-4 mb-5" style={{ borderRadius: "20px", background: "rgba(30,30,30,0.5)" }}>
          <div className="display-4 mb-3">🤷</div>
          <h4 className="fw-bold text-white">No Matching Results</h4>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "450px" }}>
            We couldn't find any travelers matching "{query}" on this tab. Try searching for different names, travel styles, or interests.
          </p>
          <button className="btn btn-warning fw-semibold px-4" onClick={handleClearSearch} style={{ borderRadius: "10px" }}>
            Clear Search
          </button>
        </div>
      );
    }

    if (activeTab === "friends") {
      return (
        <div className="glass-card text-center py-5 px-4 mb-5" style={{ borderRadius: "20px", background: "rgba(30,30,30,0.5)" }}>
          <div className="display-4 mb-3">🤝</div>
          <h4 className="fw-bold text-white">No Friends Yet</h4>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "450px" }}>
            Connect with travelers from around the world to share plans, messages, and coordinates!
          </p>
          <button className="btn btn-warning fw-semibold px-4" onClick={() => handleTabChange("suggestions")} style={{ borderRadius: "10px" }}>
            Explore Suggested Travelers
          </button>
        </div>
      );
    }

    if (activeTab === "sent") {
      return (
        <div className="glass-card text-center py-5 px-4 mb-5" style={{ borderRadius: "20px", background: "rgba(30,30,30,0.5)" }}>
          <div className="display-4 mb-3">📬</div>
          <h4 className="fw-bold text-white">No Sent Requests</h4>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "450px" }}>
            Travelers you request connection with will appear here until they accept or decline.
          </p>
          <button className="btn btn-warning fw-semibold px-4" onClick={() => handleTabChange("suggestions")} style={{ borderRadius: "10px" }}>
            Find Travelers
          </button>
        </div>
      );
    }

    if (activeTab === "received") {
      return (
        <div className="glass-card text-center py-5 px-4 mb-5" style={{ borderRadius: "20px", background: "rgba(30,30,30,0.5)" }}>
          <div className="display-4 mb-3">📭</div>
          <h4 className="fw-bold text-white">No Incoming Requests</h4>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: "450px" }}>
            No pending incoming request invitations. You are completely caught up!
          </p>
        </div>
      );
    }

    return (
      <div className="glass-card text-center py-5 px-4 mb-5" style={{ borderRadius: "20px", background: "rgba(30,30,30,0.5)" }}>
        <div className="display-4 mb-3">🔍</div>
        <h4 className="fw-bold text-white">No Suggested Travelers</h4>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: "450px" }}>
          We could not find any other travelers matching your profile style. Update your travel styles or check back later!
        </p>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        paddingTop: "60px",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <div className="container py-5">
        {/* Header Title Section */}
        <div className="glass-card p-4 mb-4" style={{ background: "rgba(25, 25, 25, 0.7)", borderRadius: "20px" }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="fw-bold m-0 text-warning" style={{ fontSize: "2rem" }}>
                ❤️ Friends & Connections
              </h1>
              <p className="text-secondary m-0 mt-1" style={{ fontSize: "14px" }}>
                Redesigned dashboard to explore, connect, follow, and message your travel community.
              </p>
            </div>

            {/* Debounced Search bar inside Header */}
            <div style={{ minWidth: "280px" }}>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">🔍</span>
                <input
                  type="text"
                  className="form-control bg-black text-light border-secondary shadow-none"
                  placeholder="Search name, travel style, interests..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ borderRadius: "0 8px 8px 0" }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Step 2 layout) */}
          <div className="d-flex mt-4 overflow-x-auto pb-2 border-bottom border-secondary gap-2" style={{ borderBottomColor: "rgba(255,255,255,0.08) !important" }}>
            {[
              { id: "friends", label: "Friends 🤝" },
              { id: "sent", label: "Sent Requests 📬" },
              { id: "received", label: "Received Requests 📭" },
              { id: "suggestions", label: "Suggested Travelers ✨" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`btn btn-sm px-3 py-2 fw-semibold text-nowrap`}
                style={{
                  borderRadius: "8px",
                  background: activeTab === tab.id ? "#ffb703" : "transparent",
                  color: activeTab === tab.id ? "#111" : "#aaa",
                  border: "none",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Metadata Summary */}
        {!loading && items.length > 0 && (
          <div className="mb-3 px-1">
            <small className="text-secondary">
              Showing {items.length} of {totalResults} results on Page {currentPage}
            </small>
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Discovering travelers list...</p>
          </div>
        ) : items.length === 0 ? (
          renderEmptyState()
        ) : (
          <div>
            <div className="row g-4">
              {items.map((item) => {
                let userObj = item;
                let reqId = null;

                if (activeTab === "sent") {
                  userObj = item.receiver;
                  reqId = item._id;
                } else if (activeTab === "received") {
                  userObj = item.sender;
                  reqId = item._id;
                }

                return (
                  <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={item._id || userObj._id}>
                    <FriendCard
                      user={userObj}
                      variant={
                        activeTab === "friends"
                          ? "friend"
                          : activeTab === "sent"
                          ? "sent-request"
                          : activeTab === "received"
                          ? "received-request"
                          : "suggestion"
                      }
                      matchScore={item.matchScore}
                      isFollowing={item.isFollowing}
                      requestStatus={item.status}
                      loadingAction={actionLoading}
                      onAccept={() => handleAcceptRequest(reqId)}
                      onReject={() => handleRejectRequest(reqId)}
                      onCancel={() => handleCancelRequest(reqId)}
                      onRemove={() => handleRemoveFriend(userObj._id)}
                      onSendRequest={() => handleSendRequest(userObj._id)}
                      onFollowToggle={() => handleFollowToggle(userObj._id, item.isFollowing)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Pagination component rendering */}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;