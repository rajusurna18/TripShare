import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import API
from "../services/api";

import socket
from "../socket";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import Avatar from "../components/shared/Avatar";
import SaveButton from "../components/shared/SaveButton";
import ShareButton from "../components/shared/ShareButton";

const styles = {
  container: {
    background: "#111",
    minHeight: "100vh",
    color: "white",
    padding: "30px",
    fontFamily: "'Inter', sans-serif"
  },
  headerCard: {
    background: "linear-gradient(135deg, #1e1e1e 0%, #121212 100%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "30px",
    borderRadius: "24px",
    marginBottom: "24px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
  },
  ownerCard: {
    background: "linear-gradient(135deg, #221d13 0%, #1a150c 100%)",
    border: "1px solid rgba(255, 193, 7, 0.15)",
    padding: "24px",
    borderRadius: "20px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontWeight: "700",
    letterSpacing: "-0.5px",
    marginBottom: "20px"
  },
  metaText: {
    color: "#aaa",
    fontSize: "15px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  tagBadge: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#eee",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    marginRight: "6px",
    display: "inline-block"
  },
  statusBadge: (status) => {
    const colors = {
      upcoming: { bg: "rgba(13, 202, 240, 0.15)", color: "#0dcaf0" },
      active: { bg: "rgba(25, 135, 84, 0.15)", color: "#198754" },
      completed: { bg: "rgba(108, 117, 125, 0.15)", color: "#6c757d" },
      cancelled: { bg: "rgba(220, 53, 69, 0.15)", color: "#dc3545" }
    };
    const current = colors[status] || colors.upcoming;
    return {
      background: current.bg,
      color: current.color,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "capitalize",
      display: "inline-block"
    };
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px"
  },
  modalContent: {
    background: "#1e1e1e",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "24px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.5)"
  },
  input: {
    background: "#2a2a2a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    marginBottom: "16px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ccc",
    marginBottom: "6px",
    display: "block"
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "14px",
    marginBottom: "10px"
  }
};

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [location, setLocation] = useState(null);
  const [membersLocations, setMembersLocations] = useState([]);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  
  // Selected member for actions
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    title: "",
    destination: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    travelStyle: "",
    tags: "",
    maxMembers: 10,
    status: "upcoming"
  });
  const [editImage, setEditImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // FETCH TRIP
  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  // SOCKET GPS
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_trip", tripId);

    // RECEIVE LIVE LOCATIONS
    socket.on("update_locations", (data) => {
      setMembersLocations(data);
    });

    return () => {
      socket.off("update_locations");
    };
  }, [tripId]);

  // LIVE GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setLocation(coords);

          const currentUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );

          socket.emit("live_location", {
            tripId,
            userId: currentUser._id,
            name: currentUser.name,
            ...coords,
          });
        },
        (err) => {
          console.log(err);
        },
        {
          enableHighAccuracy: true,
        }
      );
    }
  }, [tripId]);

  // FETCH TRIP IMPLEMENTATION
  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTrip(res.data.trip || res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // CHECK SAVED STATUS
  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      if (window.savedTripIds) {
        setIsSaved(window.savedTripIds.has(tripId));
      } else {
        try {
          const res = await API.get("/saves");
          const ids = new Set((res.data.saves || []).map((s) => s.trip?._id).filter(Boolean));
          window.savedTripIds = ids;
          setIsSaved(ids.has(tripId));
        } catch (err) {
          console.error("Error checking saved status in TripDetails:", err);
        }
      }
    };
    if (trip) {
      checkSavedStatus();
    }
  }, [tripId, trip]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000/${imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openEditModal = () => {
    setEditData({
      title: trip.title || "",
      destination: trip.destination || "",
      description: trip.description || "",
      budget: trip.budget || "",
      startDate: trip.startDate ? trip.startDate.split("T")[0] : (trip.date ? trip.date.split("T")[0] : ""),
      endDate: trip.endDate ? trip.endDate.split("T")[0] : "",
      travelStyle: trip.travelStyle || "",
      tags: trip.tags ? trip.tags.join(", ") : "",
      maxMembers: trip.maxMembers || 10,
      status: trip.status || "upcoming"
    });
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const formData = new FormData();
      Object.keys(editData).forEach((key) => {
        formData.append(key, editData[key]);
      });
      if (editImage) {
        formData.append("image", editImage);
      }

      const token = localStorage.getItem("token");
      await API.put(`/trips/${tripId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Trip updated successfully ✏️");
      setShowEditModal(false);
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Trip deleted successfully 🗑️");
      setShowDeleteModal(false);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete trip");
    }
  };

  const handleLeaveConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/trips/${tripId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Left trip successfully 🚪");
      setShowLeaveModal(false);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave trip");
    }
  };

  const handleRemoveMemberConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/trips/${tripId}/remove-member`, { memberId: selectedMember._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Removed ${selectedMember.name} successfully`);
      setShowRemoveMemberModal(false);
      setSelectedMember(null);
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleTransferConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/trips/${tripId}/transfer-ownership`, { newOwnerId: selectedMember._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Ownership transferred to ${selectedMember.name} successfully 👑`);
      setShowTransferModal(false);
      setSelectedMember(null);
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to transfer ownership");
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="text-white p-5">
        Loading...
      </div>
    );
  }

  // TRIP NOT FOUND
  if (!trip) {
    return (
      <div className="text-white p-5">
        Trip not found
      </div>
    );
  }

  const isOwner = trip.createdBy && (trip.createdBy._id === currentUser._id || trip.createdBy === currentUser._id);
  const isMember = trip.members && trip.members.some(m => (m._id === currentUser._id || m === currentUser._id));

  return (
    <div style={styles.container}>
      
      {/* TRIP HEADER CARD */}
      <div style={styles.headerCard}>
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <img 
              src={getImageUrl(trip.image)} 
              alt={trip.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            />
          </div>
          <div className="col-md-8 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <h1 className="m-0" style={{ fontSize: "32px", fontWeight: "700" }}>{trip.title}</h1>
                <div style={styles.statusBadge(trip.status)}>{trip.status}</div>
              </div>
              <p className="text-warning fw-semibold mb-3" style={{ fontSize: "18px" }}>📍 {trip.destination}</p>
              
              {trip.description && (
                <p className="text-secondary mb-3" style={{ fontSize: "14px", lineHeight: "1.5" }}>{trip.description}</p>
              )}

              <div className="d-flex flex-wrap gap-3 mb-3">
                <div style={styles.metaText}>
                  📅 <span>{formatDate(trip.startDate || trip.date)} {trip.endDate ? `- ${formatDate(trip.endDate)}` : ""}</span>
                </div>
                <div style={styles.metaText}>
                  💰 <span>Budget: ${trip.budget?.toLocaleString()}</span>
                </div>
                <div style={styles.metaText}>
                  👥 <span>Members: {trip.totalMembers || trip.members?.length} / {trip.maxMembers}</span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary" style={{ fontSize: "13px" }}>Organized by:</span>
                <span className="fw-semibold">{trip.createdBy?.name || "Unknown"}</span>
              </div>
              
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <SaveButton
                  tripId={tripId}
                  initialSaved={isSaved}
                  initialCount={trip.savesCount || 0}
                  onToggle={(savedState, newCount) => {
                    setIsSaved(savedState);
                    if (window.savedTripIds) {
                      if (savedState) {
                        window.savedTripIds.add(tripId);
                      } else {
                        window.savedTripIds.delete(tripId);
                      }
                    }
                    setTrip((prev) => ({ ...prev, savesCount: newCount }));
                  }}
                />
                <ShareButton
                  tripId={tripId}
                  tripTitle={trip.title}
                  tripDestination={trip.destination}
                  initialCount={trip.sharesCount || 0}
                />

                {isOwner && (
                  <>
                    <button className="btn btn-warning btn-sm px-3" onClick={openEditModal}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-sm px-3" onClick={() => setShowDeleteModal(true)}>
                      🗑️ Delete
                    </button>
                  </>
                )}
                {isMember && !isOwner && (
                  <button className="btn btn-outline-danger btn-sm px-3" onClick={() => setShowLeaveModal(true)}>
                    🚪 Leave Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {trip.tags && trip.tags.length > 0 && (
          <div className="mt-3">
            {trip.tags.map((tag, idx) => (
              <span key={idx} style={styles.tagBadge}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* OWNER CONTROLS PANEL */}
      {isOwner && (
        <div style={styles.ownerCard}>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h3 className="m-0" style={{ fontWeight: "700", color: "#ffc107" }}>🛠️ Owner Administration</h3>
            <Link to={`/join-requests/${tripId}`} className="btn btn-warning px-4">
              Manage Join Requests 👥
            </Link>
          </div>

          <h5 className="mb-3 text-secondary">Trip Teammates ({trip.members?.length})</h5>
          <div className="row">
            {trip.members?.map((member) => {
              const isMemberOwner = member._id === currentUser._id;
              return (
                <div className="col-lg-6" key={member._id}>
                  <div style={styles.memberRow}>
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: "#333",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        <Avatar
                          src={member.profileImage}
                          alt={member.name}
                          size={42}
                        />
                      </div>
                      <div>
                        <p className="m-0 fw-semibold">{member.name}</p>
                        <small className="text-secondary">
                          {isMemberOwner ? "👑 Trip Owner" : "Teammate"}
                        </small>
                      </div>
                    </div>

                    {!isMemberOwner && (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowTransferModal(true);
                          }}
                        >
                          👑 Transfer
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRemoveMemberModal(true);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TRACKING MAP SECTION */}
      <h1 className="mb-4 mt-5">
        🌍 Trip Live Tracking
      </h1>

      {/* TEAMMATES LIVE COORDINATES */}
      <div
        style={{
          background: "#1e1e1e",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <h3>
          Live Members Locations
        </h3>

        {membersLocations.length === 0 ? (
          <p className="text-secondary my-2">No members are currently sharing their location live.</p>
        ) : (
          membersLocations.map((member) => (
            <div
              key={member.userId}
              style={{
                flexWrap: "wrap",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  color: "lime",
                  fontSize: "20px",
                }}
              >
                ●
              </span>
              <span>
                {member.name}
              </span>
              <span
                style={{
                  color: "#aaa",
                }}
              >
                ({member.lat.toFixed(3)}, {member.lng.toFixed(3)})
              </span>
            </div>
          ))
        )}
      </div>

      {/* MAP */}
      {location && (
        <MapContainer
          center={[
            location.lat,
            location.lng,
          ]}
          zoom={13}
          style={{
            height: "450px",
            width: "100%",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {membersLocations.map((member) => (
            <Marker
              key={member.userId}
              position={[
                member.lat,
                member.lng,
              ]}
            >
              <Popup>
                🟢 {member.name}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* TRIP LINKS/ACTIONS */}
      <div className="mt-4 d-flex gap-3 flex-wrap">
        <Link
          to={`/chat/${tripId}`}
          className="btn btn-warning"
        >
          Open Chat 💬
        </Link>
        <Link
          to={`/expenses/${tripId}`}
          className="btn btn-outline-warning"
        >
          Expenses 💳
        </Link>
        <Link
          to={`/memories/${tripId}`}
          className="btn btn-outline-light"
        >   
          📸 Memories
        </Link>
      </div>

      {/* ============================================================== */}
      {/* MODALS */}
      {/* ============================================================== */}

      {/* EDIT TRIP MODAL */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0" style={{ fontWeight: "700" }}>Edit Trip Details ✏️</h3>
              <button 
                className="btn-close btn-close-white" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label style={styles.label}>Trip Title</label>
              <input 
                type="text" 
                name="title" 
                value={editData.title}
                onChange={handleEditChange} 
                style={styles.input} 
                required 
              />

              <label style={styles.label}>Destination</label>
              <input 
                type="text" 
                name="destination" 
                value={editData.destination}
                onChange={handleEditChange} 
                style={styles.input} 
                required 
              />

              <label style={styles.label}>Description</label>
              <textarea 
                name="description" 
                value={editData.description}
                onChange={handleEditChange} 
                style={{ ...styles.input, height: "100px", resize: "none" }} 
              />

              <div className="row">
                <div className="col-md-6">
                  <label style={styles.label}>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={editData.startDate}
                    onChange={handleEditChange} 
                    style={styles.input} 
                  />
                </div>
                <div className="col-md-6">
                  <label style={styles.label}>End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={editData.endDate}
                    onChange={handleEditChange} 
                    style={styles.input} 
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label style={styles.label}>Budget ($)</label>
                  <input 
                    type="number" 
                    name="budget" 
                    value={editData.budget}
                    onChange={handleEditChange} 
                    style={styles.input} 
                    min="0"
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label style={styles.label}>Max Members</label>
                  <input 
                    type="number" 
                    name="maxMembers" 
                    value={editData.maxMembers}
                    onChange={handleEditChange} 
                    style={styles.input} 
                    min="1"
                    required 
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label style={styles.label}>Travel Style</label>
                  <input 
                    type="text" 
                    name="travelStyle" 
                    value={editData.travelStyle}
                    onChange={handleEditChange} 
                    style={styles.input} 
                    placeholder="e.g. Budget, Luxury"
                  />
                </div>
                <div className="col-md-6">
                  <label style={styles.label}>Status</label>
                  <select 
                    name="status"
                    value={editData.status}
                    onChange={handleEditChange}
                    style={styles.input}
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              <label style={styles.label}>Tags (comma-separated)</label>
              <input 
                type="text" 
                name="tags" 
                value={editData.tags}
                onChange={handleEditChange} 
                style={styles.input} 
                placeholder="e.g. beach, adventure, solo"
              />

              <label style={styles.label}>Trip Cover Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files[0])}
                style={styles.input} 
              />

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TRIP CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Delete Trip 🗑️</h4>
            <p className="my-3 text-secondary">
              Are you sure you want to delete <strong>{trip.title}</strong>? 
              This will permanently delete the trip and all associated chats, expenses, settlements, memories, reviews, and notifications. This action cannot be undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Yes, Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE TRIP CONFIRMATION MODAL */}
      {showLeaveModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Leave Trip 🚪</h4>
            <p className="my-3 text-secondary">
              Are you sure you want to leave the trip <strong>{trip.title}</strong>?
              You will lose access to this trip's chats, expenses, and maps.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLeaveConfirm}>
                Yes, Leave Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MEMBER MODAL */}
      {showRemoveMemberModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Remove Teammate 👤</h4>
            <p className="my-3 text-secondary">
              Are you sure you want to remove <strong>{selectedMember?.name}</strong> from the trip?
              They will no longer have access to this trip.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowRemoveMemberModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRemoveMemberConfirm}>
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER OWNERSHIP MODAL */}
      {showTransferModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Transfer Trip Ownership 👑</h4>
            <p className="my-3 text-secondary">
              Are you sure you want to transfer ownership of this trip to <strong>{selectedMember?.name}</strong>?
              You will lose administrator controls and become a regular member of the trip.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-warning" onClick={handleTransferConfirm}>
                Transfer Ownership
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TripDetails;