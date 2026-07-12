import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getTimeline,
  saveTimelineNote,
  logTimelineLocation,
  generateTimelineAIStory,
  editTimelineEvent,
  deleteTimelineEvent
} from "../services/timeline.api";
import Avatar from "../components/shared/Avatar";

function Timeline() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [trip, setTrip] = useState(null);
  const [summary, setSummary] = useState(null);
  const [days, setDays] = useState([]);
  const [travelStory, setTravelStory] = useState("");
  const [tripSummary, setTripSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Note editor states (keyed by dayNumber)
  const [noteInputs, setNoteInputs] = useState({});
  
  // Custom event toggle panels
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({
    place: "",
    city: "",
    lat: "",
    lng: "",
    visitTime: ""
  });

  // Expanded details state (keyed by event id)
  const [expandedEvents, setExpandedEvents] = useState({});

  // Editing event states
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEventType, setEditingEventType] = useState("");
  const [editEventForm, setEditEventForm] = useState({
    noteText: "",
    place: "",
    city: "",
    lat: "",
    lng: "",
    timestamp: ""
  });

  useEffect(() => {
    fetchTimelineData();
  }, [tripId]);

  async function fetchTimelineData() {
    try {
      setLoading(true);
      const res = await getTimeline(tripId);
      if (res.data.success) {
        setTrip(res.data.trip);
        setSummary(res.data.summary);
        setDays(res.data.days);
        setTravelStory(res.data.travelStory || "");
        setTripSummary(res.data.tripSummary || null);

        // Pre-fill note inputs for editing
        const notesObj = {};
        res.data.days.forEach(d => {
          notesObj[d.dayNumber] = d.notes || "";
        });
        setNoteInputs(notesObj);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load travel timeline");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (dayNumber, dateStr) => {
    try {
      setActionLoading(true);
      const text = noteInputs[dayNumber] || "";
      
      // Calculate timestamp for the target day date
      const timestamp = new Date(dateStr);
      // Set to noon to keep timeOfDay within standard range
      timestamp.setHours(12, 0, 0, 0);

      const res = await saveTimelineNote(tripId, {
        noteText: text,
        timestamp: timestamp.toISOString()
      });

      if (res.data.success) {
        toast.success(`Note saved for Day ${dayNumber}! 📝`);
        fetchTimelineData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save daily note");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogLocation = async (e) => {
    e.preventDefault();
    if (!locationForm.place || !locationForm.city) {
      toast.error("Please fill place and city names");
      return;
    }

    try {
      setActionLoading(true);
      const res = await logTimelineLocation(tripId, {
        ...locationForm,
        visitTime: locationForm.visitTime ? new Date(locationForm.visitTime).toISOString() : new Date().toISOString()
      });

      if (res.data.success) {
        toast.success("Location logged to timeline! 📍");
        setShowLocationForm(false);
        setLocationForm({
          place: "",
          city: "",
          lat: "",
          lng: "",
          visitTime: ""
        });
        fetchTimelineData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save location checkpoint");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateAIStory = async () => {
    try {
      setAiGenerating(true);
      toast("Gemini is compiling notes, photos, and expenses into a travel story...", { icon: "🤖", duration: 4000 });
      const res = await generateTimelineAIStory(tripId);
      if (res.data.success) {
        setTravelStory(res.data.travelStory);
        setTripSummary(res.data.tripSummary);
        toast.success("AI travel story compiled! 📖");
        fetchTimelineData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Gemini AI failed to compile travel story");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleStartEditEvent = (evt) => {
    setEditingEventId(evt._id);
    setEditingEventType(evt.type);
    setEditEventForm({
      noteText: evt.type === "Note" ? evt.description : "",
      place: evt.type === "Location" ? evt.title : "",
      city: evt.type === "Location" ? evt.details.locationData?.city : "",
      lat: evt.type === "Location" ? evt.details.locationData?.lat || "" : "",
      lng: evt.type === "Location" ? evt.details.locationData?.lng || "" : "",
      timestamp: evt.timestamp ? new Date(evt.timestamp).toISOString().slice(0, 16) : ""
    });
  };

  const handleSaveEditEvent = async () => {
    try {
      setActionLoading(true);
      await editTimelineEvent(tripId, editingEventId, editEventForm);
      toast.success("Timeline event updated successfully! 🎉");
      setEditingEventId(null);
      fetchTimelineData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event from the timeline?")) return;
    try {
      setActionLoading(true);
      await deleteTimelineEvent(tripId, eventId);
      toast.success("Event deleted from timeline 🗑️");
      fetchTimelineData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete event");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEventDetails = (eventId) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" style={{ width: "3rem", height: "3rem" }} />
          <h4>Assembling your travel timeline desk...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-vh-100 text-light py-5" style={{ background: "#0c0c0e" }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
          <div>
            <h1 className="fw-bold m-0 display-5 text-warning">📅 Travel Timeline</h1>
            <p className="text-secondary m-0 mt-1">Chronological summary logs of your trip checkpoints</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-warning"
              onClick={() => setShowLocationForm(!showLocationForm)}
            >
              📍 Log Checkpoint
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              ◀ Back
            </button>
          </div>
        </div>

        {/* LOG LOCATION OVERLAY FORM */}
        {showLocationForm && (
          <div className="glass-card p-4 mb-4 border border-warning border-opacity-25" style={{ background: "rgba(30, 25, 15, 0.45)" }}>
            <h5 className="fw-bold text-warning mb-3">📍 Log Location Checkpoint</h5>
            <form onSubmit={handleLogLocation} className="row g-3">
              <div className="col-md-6 col-lg-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Place Name (e.g. Baga Beach)" 
                  value={locationForm.place} 
                  onChange={e => setLocationForm({...locationForm, place: e.target.value})} 
                  required
                />
              </div>
              <div className="col-md-6 col-lg-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="City/Region (e.g. Goa)" 
                  value={locationForm.city} 
                  onChange={e => setLocationForm({...locationForm, city: e.target.value})} 
                  required
                />
              </div>
              <div className="col-6 col-lg-2">
                <input 
                  type="number" 
                  step="0.0001" 
                  className="form-control" 
                  placeholder="Latitude (optional)" 
                  value={locationForm.lat} 
                  onChange={e => setLocationForm({...locationForm, lat: e.target.value})} 
                />
              </div>
              <div className="col-6 col-lg-2">
                <input 
                  type="number" 
                  step="0.0001" 
                  className="form-control" 
                  placeholder="Longitude (optional)" 
                  value={locationForm.lng} 
                  onChange={e => setLocationForm({...locationForm, lng: e.target.value})} 
                />
              </div>
              <div className="col-md-6 col-lg-2">
                <input 
                  type="datetime-local" 
                  className="form-control text-secondary" 
                  value={locationForm.visitTime} 
                  onChange={e => setLocationForm({...locationForm, visitTime: e.target.value})} 
                />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowLocationForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-warning" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Log Location"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUMMARY STATS PANELS */}
        {summary && (
          <div className="glass-card p-4 mb-5" style={{ background: "rgba(20, 20, 25, 0.55)" }}>
            <h4 className="fw-bold text-warning mb-4">Trip Summary Metrics 📊</h4>
            <div className="row text-center g-3">
              <div className="col-6 col-md-4 col-lg-2 border-end border-secondary border-opacity-15">
                <h3 className="text-light fw-bold mb-1">{summary.totalDays}</h3>
                <small className="text-secondary d-block">Total Days</small>
              </div>
              <div className="col-6 col-md-4 col-lg-2 border-end border-secondary border-opacity-15">
                <h3 className="text-light fw-bold mb-1">{summary.memoriesCount}</h3>
                <small className="text-secondary d-block">Memories</small>
              </div>
              <div className="col-6 col-md-4 col-lg-2 border-end border-secondary border-opacity-15">
                <h3 className="text-light fw-bold mb-1">{summary.photosCount}</h3>
                <small className="text-secondary d-block">Photos</small>
              </div>
              <div className="col-6 col-md-4 col-lg-2 border-end border-secondary border-opacity-15">
                <h3 className="text-light fw-bold mb-1">{summary.expensesCount}</h3>
                <small className="text-secondary d-block">Expenses</small>
              </div>
              <div className="col-6 col-md-4 col-lg-2 border-end border-secondary border-opacity-15">
                <h3 className="text-info fw-bold mb-1">
                  {summary.totalDistance > 0 ? `${summary.totalDistance} km` : "N/A"}
                </h3>
                <small className="text-secondary d-block">Distance</small>
              </div>
              <div className="col-6 col-md-4 col-lg-2">
                <h3 className="text-warning fw-bold mb-1">₹{summary.totalCost}</h3>
                <small className="text-secondary d-block">Total Cost</small>
              </div>
            </div>
          </div>
        )}

        {/* AI TRAVEL STORY & TRIP SUMMARY PANEL */}
        <div className="glass-card p-4 p-md-5 mb-5 border border-warning border-opacity-15">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h3 className="fw-bold text-warning m-0">📖 AI Travel Memoir Story</h3>
              <p className="text-secondary m-0 small mt-1">AI compiled travel logs, stats highlights, and street guide advice</p>
            </div>
            <button 
              className="btn btn-warning fw-bold px-4 py-2" 
              onClick={handleGenerateAIStory}
              disabled={aiGenerating}
            >
              {aiGenerating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Compiling...
                </>
              ) : (
                "🤖 Compile AI Story"
              )}
            </button>
          </div>

          {travelStory ? (
            <div className="row g-4 border-top border-secondary border-opacity-15 pt-4">
              <div className="col-12 col-lg-8 border-end border-secondary border-opacity-15">
                <h5 className="text-warning fw-bold mb-3">The Chronicles 📝</h5>
                <div 
                  className="text-light-50 small timeline-markdown" 
                  style={{ whiteSpace: "pre-line", lineHeight: "1.7", fontSize: "14.5px" }}
                >
                  {travelStory}
                </div>
              </div>
              
              {tripSummary && (
                <div className="col-12 col-lg-4">
                  <h5 className="text-warning fw-bold mb-3">AI Travel Highlights 🌟</h5>
                  <div className="p-3 bg-black bg-opacity-30 rounded-4 border border-secondary border-opacity-10">
                    <div className="mb-3">
                      <small className="text-secondary d-block">Cities Visited</small>
                      <span className="fw-bold text-light">{tripSummary.citiesVisited?.join(", ") || "Goa"}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-secondary d-block">Budget Breakdown</small>
                      <span className="fw-bold text-light">{tripSummary.budgetSummary}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-secondary d-block">Favorite Day Highlight</small>
                      <span className="fw-bold text-success">{tripSummary.favoriteDay}</span>
                    </div>
                    <div>
                      <small className="text-secondary d-block mb-1">Wanderer Recommendations</small>
                      <ul className="m-0 ps-3 small text-secondary">
                        {tripSummary.recommendations?.map((rec, i) => (
                          <li key={i} className="mb-1">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5 bg-black bg-opacity-20 rounded-4">
              <span className="display-6 d-block mb-3">🤖</span>
              <p className="text-secondary m-0">No travel memoir generated yet.</p>
              <small className="text-muted">Click the button above to let Gemini compile your trip logs.</small>
            </div>
          )}
        </div>

        {/* DAY CARDS TIMELINE GRID */}
        <h3 className="fw-bold text-warning mb-4">📅 Daily Timeline Records</h3>
        
        {days.length === 0 ? (
          <div className="glass-card text-center py-5">
            <span className="display-4 d-block mb-3">🌍</span>
            <h4 className="text-secondary">No travel logs recorded yet.</h4>
            <p className="text-muted small">Add memories, track location points, or log expenses to populate your timeline.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-5">
            {days.map((day) => (
              <div key={day.dayNumber} className="glass-card p-4 p-md-5 position-relative overflow-hidden">
                <div 
                  className="position-absolute top-0 start-0 h-100 bg-warning" 
                  style={{ width: "4px", opacity: 0.8 }} 
                />

                {/* DAY HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom border-secondary border-opacity-15">
                  <div>
                    <h3 className="fw-bold text-white m-0">Day {day.dayNumber}</h3>
                    <small className="text-secondary">{new Date(day.date).toDateString()}</small>
                  </div>
                  <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                    {day.events?.length || 0} events logged
                  </span>
                </div>

                {/* DAY NOTES EDIT PANEL */}
                <div className="mb-4 bg-black bg-opacity-25 p-4 rounded-4 border border-secondary border-opacity-10">
                  <label className="form-label text-warning small fw-bold mb-2">Day Summary & Thoughts 📝</label>
                  <textarea 
                    className="form-control bg-dark border-secondary border-opacity-20 text-light mb-2"
                    rows="2"
                    placeholder="Describe your highlight moments or restaurant notes..."
                    value={noteInputs[day.dayNumber] || ""}
                    onChange={e => setNoteInputs({
                      ...noteInputs,
                      [day.dayNumber]: e.target.value
                    })}
                  />
                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleSaveNote(day.dayNumber, day.date)}
                      disabled={actionLoading}
                    >
                      Save Note 💾
                    </button>
                  </div>
                </div>

                {/* TIMELINE EVENTS VIEW */}
                <div className="d-flex flex-column gap-4 ps-2">
                  {day.events?.map((evt, idx) => (
                    <div key={evt._id || idx} className="d-flex gap-3 position-relative timeline-row-block">
                      {/* Vertical connector line */}
                      {idx < day.events.length - 1 && (
                        <div 
                          className="position-absolute bg-secondary bg-opacity-20"
                          style={{
                            left: "17px",
                            top: "36px",
                            width: "2px",
                            height: "calc(100% + 20px)",
                            zIndex: 1
                          }}
                        />
                      )}

                      {/* Icon bubble */}
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center border"
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "#16161a",
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          zIndex: 2,
                          flexShrink: 0
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>{evt.icon}</span>
                      </div>

                      {/* Event Details Card */}
                      <div className="flex-grow-1 bg-black bg-opacity-20 p-3 rounded-4 border border-secondary border-opacity-10">
                        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-1">
                          <h6 className="m-0 fw-bold text-light">{evt.title}</h6>
                          <small className="text-secondary" style={{ fontSize: "11px" }}>
                            ⏱️ {evt.timeOfDay} ({new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </small>
                        </div>
                        
                        <p className="text-secondary small m-0 mb-2">{evt.description}</p>
                        
                        {/* Event Details Expand Toggle */}
                        <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
                          <button 
                            className="btn btn-xs btn-link text-warning p-0 text-decoration-none small"
                            onClick={() => toggleEventDetails(evt._id || `${day.dayNumber}-${idx}`)}
                            style={{ fontSize: "12px" }}
                          >
                            {expandedEvents[evt._id || `${day.dayNumber}-${idx}`] ? "Hide Details ▲" : "View Details ▼"}
                          </button>
                          
                          {evt.details?.createdById && currentUser && (evt.details.createdById === currentUser._id || evt.details.createdById === currentUser.id) && (evt.type === "Note" || evt.type === "Location") && (
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-xs btn-outline-secondary text-light px-2"
                                onClick={() => handleStartEditEvent(evt)}
                                style={{ fontSize: "11px", padding: "1px 5px" }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className="btn btn-xs btn-outline-danger px-2"
                                onClick={() => handleDeleteEvent(evt._id)}
                                style={{ fontSize: "11px", padding: "1px 5px" }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Collapsible Details Content */}
                        {expandedEvents[evt._id || `${day.dayNumber}-${idx}`] && (
                          <div className="mt-3 p-3 rounded bg-black bg-opacity-40 border-top border-secondary border-opacity-10 small text-secondary">
                            {evt.type === "Memory" && evt.details?.image && (
                              <div className="d-flex flex-column gap-2">
                                <img 
                                  src={evt.details.image.startsWith("http") ? evt.details.image : `http://localhost:5000/${evt.details.image}`} 
                                  alt="Memory" 
                                  className="img-fluid rounded border border-secondary border-opacity-15"
                                  style={{ maxHeight: "250px", width: "100%", objectFit: "cover" }}
                                />
                                {evt.details.caption && <p className="m-0 italic">"{evt.details.caption}"</p>}
                                <small className="text-muted mt-1">Uploaded by: {evt.details.user} • {evt.details.likesCount} Likes • {evt.details.commentsCount} Comments</small>
                              </div>
                            )}

                            {evt.type === "Expense" && (
                              <div>
                                <p className="mb-1 text-light">Transaction Info:</p>
                                <ul className="m-0 ps-3">
                                  <li>Paid by: <strong>{evt.details.paidBy || "Unknown"}</strong></li>
                                  <li>Category: <strong>{evt.details.category}</strong></li>
                                  <li>Method: <strong>Cash</strong></li>
                                  {evt.details.note && <li>Note: <em>"{evt.details.note}"</em></li>}
                                </ul>
                              </div>
                            )}

                            {evt.type === "Location" && evt.details?.locationData && (
                              <div>
                                <p className="mb-1 text-light">Checkpoint coordinates:</p>
                                <ul className="m-0 ps-3">
                                  <li>Place: <strong>{evt.details.locationData.place}</strong></li>
                                  <li>City/Region: <strong>{evt.details.locationData.city}</strong></li>
                                  {evt.details.locationData.lat && (
                                    <li>Coordinates: <code>{evt.details.locationData.lat.toFixed(4)}, {evt.details.locationData.lng.toFixed(4)}</code></li>
                                  )}
                                  <li>Timestamp: {new Date(evt.details.locationData.visitTime).toLocaleString()}</li>
                                </ul>
                              </div>
                            )}

                            {evt.type === "Note" && (
                              <div>
                                <p className="m-0">Custom daily note text logged on timeline.</p>
                                <small className="text-muted mt-1">Saved by member: {evt.details.createdBy || "Member"}</small>
                              </div>
                            )}

                            {evt.type === "AIStoryMarker" && (
                              <div>
                                <p className="m-0">{evt.description}</p>
                                <small className="text-muted">Generated by Gemini model.</small>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {editingEventId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div className="glass-card p-4" style={{ width: "100%", maxWidth: "500px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0 text-warning">Edit Timeline Event ✏️</h3>
              <button className="btn-close btn-close-white" onClick={() => setEditingEventId(null)}></button>
            </div>
            
            <label className="form-label text-light">Event Timestamp</label>
            <input
              type="datetime-local"
              className="form-control mb-3 bg-dark text-light border-secondary"
              value={editEventForm.timestamp}
              onChange={(e) => setEditEventForm({ ...editEventForm, timestamp: e.target.value })}
            />

            {editingEventType === "Note" && (
              <>
                <label className="form-label text-light">Note Text</label>
                <textarea
                  className="form-control mb-4 bg-dark text-light border-secondary"
                  rows={4}
                  value={editEventForm.noteText}
                  onChange={(e) => setEditEventForm({ ...editEventForm, noteText: e.target.value })}
                  placeholder="Note description..."
                />
              </>
            )}

            {editingEventType === "Location" && (
              <>
                <label className="form-label text-light">Place Name</label>
                <input
                  type="text"
                  className="form-control mb-3 bg-dark text-light border-secondary"
                  value={editEventForm.place}
                  onChange={(e) => setEditEventForm({ ...editEventForm, place: e.target.value })}
                  placeholder="e.g. Baga Beach"
                />
                
                <label className="form-label text-light">City/Region</label>
                <input
                  type="text"
                  className="form-control mb-3 bg-dark text-light border-secondary"
                  value={editEventForm.city}
                  onChange={(e) => setEditEventForm({ ...editEventForm, city: e.target.value })}
                  placeholder="e.g. Goa"
                />

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-light">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control bg-dark text-light border-secondary"
                      value={editEventForm.lat}
                      onChange={(e) => setEditEventForm({ ...editEventForm, lat: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-light">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control bg-dark text-light border-secondary"
                      value={editEventForm.lng}
                      onChange={(e) => setEditEventForm({ ...editEventForm, lng: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setEditingEventId(null)}>Cancel</button>
              <button className="btn btn-warning text-dark fw-bold" onClick={handleSaveEditEvent}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

export default Timeline;
