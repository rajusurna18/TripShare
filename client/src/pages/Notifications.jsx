import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import API from "../services/api";
import socket from "../socket";
import NotificationCard from "../components/notification/NotificationCard";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [statusTab, setStatusTab] = useState("ALL"); // ALL, UNREAD, READ
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // FETCH NOTIFICATIONS
  const fetchNotifications = async (pageNumber = 1, selectedCategory = "ALL") => {
    try {
      setLoading(true);
      const categoryQuery = selectedCategory !== "ALL" ? `&category=${selectedCategory}` : "";
      const res = await API.get(`/notifications?page=${pageNumber}&limit=${limit}${categoryQuery}`);

      if (res.data && res.data.notifications) {
        setNotifications(res.data.notifications);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.totalResults);
        setUnreadCount(res.data.unreadCount || 0);
        setHasNextPage(res.data.hasNextPage);
        setHasPreviousPage(res.data.hasPreviousPage);
      } else {
        // Fallback for old API returns
        const list = res.data || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
        setTotalResults(list.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD & SOCKET SYNC
  useEffect(() => {
    fetchNotifications(1, category);

    // Socket Setup
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }
    socket.emit("register_user", currentUser?._id);

    const onNewNotification = (newNotification) => {
      // Show toaster notification
      toast((t) => (
        <div className="d-flex align-items-center gap-2">
          <span>🔔</span>
          <div>
            <div className="fw-bold" style={{ fontSize: "13px" }}>New Notification</div>
            <div style={{ fontSize: "12px" }}>{newNotification.message}</div>
          </div>
        </div>
      ), { duration: 4000 });

      // Refresh page 1 to see the new item
      fetchNotifications(1, category);
    };

    socket.on("new_notification", onNewNotification);

    return () => {
      socket.off("new_notification", onNewNotification);
    };
  }, [category]);

  // MARK SINGLE AS READ
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      
      // Update locally
      setNotifications(prev =>
        prev.map(item => (item._id === id ? { ...item, read: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification");
    }
  };

  // MARK ALL AS READ
  const markAllRead = async () => {
    try {
      setActionLoading(true);
      await API.put("/notifications/read-all");
      toast.success("All notifications marked as read");
      fetchNotifications(page, category);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE SINGLE NOTIFICATION
  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      toast.success("Notification deleted");
      
      // If we deleted the last item on the page, go to previous page
      const newCount = notifications.length - 1;
      if (newCount === 0 && page > 1) {
        fetchNotifications(page - 1, category);
      } else {
        fetchNotifications(page, category);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };

  // FILTERED NOTIFICATIONS BY TAB
  const getFilteredNotifications = () => {
    if (statusTab === "UNREAD") {
      return notifications.filter(n => !n.read);
    }
    if (statusTab === "READ") {
      return notifications.filter(n => n.read);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();

  // SPLIT ALL TAB BY UNREAD / READ SECTIONS
  const unreadSection = filteredNotifications.filter(n => !n.read);
  const readSection = filteredNotifications.filter(n => n.read);

  // CATEGORIES LIST
  const categories = [
    { value: "ALL", label: "All Activity", icon: "🌐" },
    { value: "FRIEND", label: "Friends", icon: "🤝" },
    { value: "TRIP", label: "Trips", icon: "✈️" },
    { value: "CHAT", label: "Chats", icon: "💬" },
    { value: "MEMORY", label: "Memories", icon: "❤️" },
    { value: "REVIEW", label: "Reviews", icon: "⭐" },
    { value: "SYSTEM", label: "System", icon: "🔔" }
  ];

  return (
    <div className="dashboard-page min-vh-100 text-light" style={{ background: "#080808" }}>
      <Toaster position="top-right" />

      {/* Dynamic styling for responsive chips container and custom animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .text-hover-underline:hover {
          text-decoration: underline !important;
        }
        .tab-btn {
          border: none;
          background: transparent;
          color: #adb5bd;
          font-weight: 600;
          padding: 8px 16px;
          border-bottom: 2px solid transparent;
          transition: all 0.25s ease;
        }
        .tab-btn.active {
          color: #ffb703;
          border-bottom: 2px solid #ffb703;
        }
        .category-chip {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          color: #ccc;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13.5px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .category-chip:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }
        .category-chip.active {
          background: #ffb703;
          color: #000;
          font-weight: 600;
          border-color: #ffb703;
        }
      `}</style>

      <div className="container py-5">
        
        {/* HEADER SECTION */}
        <div className="glass-card p-4 p-md-5 mb-4" style={{ borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
              <h1 className="fw-bold text-white mb-1">
                Notifications 🔔
              </h1>
              <p className="text-secondary mb-0">
                Stay updated with your latest social connections and trip updates.
              </p>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark fs-6 px-3 py-2" style={{ borderRadius: "8px" }}>
                {unreadCount} Unread
              </span>

              {unreadCount > 0 && (
                <button
                  className="btn btn-outline-warning btn-sm fw-bold px-3 py-2"
                  onClick={markAllRead}
                  disabled={actionLoading}
                  style={{ borderRadius: "8px" }}
                >
                  {actionLoading ? "Updating..." : "✔️ Mark All Read"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER CAROUSEL */}
        <div className="mb-4">
          <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar flex-nowrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`category-chip ${category === cat.value ? "active" : ""}`}
              >
                <span className="me-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY AND FILTER TABS */}
        <div className="glass-card p-3 p-md-4" style={{ borderRadius: "16px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
          
          {/* TABS HEADER */}
          <div className="d-flex justify-content-between align-items-center border-bottom border-secondary mb-4 flex-wrap gap-2">
            <div className="d-flex gap-1">
              <button
                className={`tab-btn ${statusTab === "ALL" ? "active" : ""}`}
                onClick={() => setStatusTab("ALL")}
              >
                All
              </button>
              <button
                className={`tab-btn ${statusTab === "UNREAD" ? "active" : ""}`}
                onClick={() => setStatusTab("UNREAD")}
              >
                Unread
              </button>
              <button
                className={`tab-btn ${statusTab === "READ" ? "active" : ""}`}
                onClick={() => setStatusTab("READ")}
              >
                Read
              </button>
            </div>
            
            <div className="text-secondary" style={{ fontSize: "13px" }}>
              Showing {filteredNotifications.length} of {totalResults} items
            </div>
          </div>

          {/* LIST STREAM */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning mb-3" role="status" />
              <h5 className="text-secondary">Syncing updates...</h5>
            </div>
          ) : filteredNotifications.length === 0 ? (
            
            /* EMPTY STATES */
            <div className="text-center py-5 px-3">
              <span className="display-3 mb-3 d-block">🔕</span>
              <h4 className="fw-bold text-warning mb-2">No Notifications Found</h4>
              <p className="text-secondary mx-auto" style={{ maxWidth: "420px", fontSize: "14.5px" }}>
                {statusTab === "UNREAD"
                  ? "You are all caught up! No unread notifications in this category."
                  : statusTab === "READ"
                  ? "No read notifications found. New actions will show up in the unread tab."
                  : "No notifications found under this filter. Complete profile details, follow users, or join trips to start seeing updates!"}
              </p>
            </div>

          ) : (
            <div className="d-flex flex-column gap-3">
              
              {/* ALL TAB GRAPHICAL DIVISION OR INDIVIDUAL VIEWS */}
              {statusTab === "ALL" ? (
                <>
                  {/* UNREAD SECTION (NEW ACTIVITY) */}
                  {unreadSection.length > 0 && (
                    <div>
                      <h6 className="text-warning fw-bold mb-3 px-1 text-uppercase tracking-wider" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                        New Activity ({unreadSection.length})
                      </h6>
                      <div className="d-flex flex-column gap-3 mb-4">
                        {unreadSection.map((item) => (
                          <NotificationCard
                            key={item._id}
                            notification={item}
                            onRead={markAsRead}
                            onDelete={deleteNotification}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* READ SECTION (EARLIER ACTIVITY) */}
                  {readSection.length > 0 && (
                    <div>
                      <h6 className="text-secondary fw-bold mb-3 px-1 text-uppercase tracking-wider" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                        Earlier
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        {readSection.map((item) => (
                          <NotificationCard
                            key={item._id}
                            notification={item}
                            onRead={markAsRead}
                            onDelete={deleteNotification}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* SEPARATED VIEWS BY TAB SELECTOR */
                filteredNotifications.map((item) => (
                  <NotificationCard
                    key={item._id}
                    notification={item}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}

            </div>
          )}

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top border-secondary flex-wrap gap-3">
              <div className="text-secondary" style={{ fontSize: "13px" }}>
                Page <b>{page}</b> of <b>{totalPages}</b>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-light btn-sm fw-bold px-3 py-2"
                  disabled={!hasPreviousPage}
                  onClick={() => fetchNotifications(page - 1, category)}
                  style={{ borderRadius: "8px" }}
                >
                  ⬅ Previous
                </button>
                
                <button
                  className="btn btn-outline-warning btn-sm fw-bold px-3 py-2"
                  disabled={!hasNextPage}
                  onClick={() => fetchNotifications(page + 1, category)}
                  style={{ borderRadius: "8px" }}
                >
                  Next ➡
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Notifications;