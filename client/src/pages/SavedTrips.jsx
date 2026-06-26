import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/shared/Avatar";
import SaveButton from "../components/shared/SaveButton";
import ShareButton from "../components/shared/ShareButton";
import { getSavedTrips } from "../services/tripSave.api";

function SavedTrips() {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch saved trips on filters or page change
  useEffect(() => {
    fetchSaves(1);
  }, [debouncedSearch, budgetMax, travelStyle, status]);

  const fetchSaves = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 6,
        search: debouncedSearch,
        budgetMax: budgetMax || undefined,
        travelStyle: travelStyle || undefined,
        status: status || undefined,
      };

      const res = await getSavedTrips(params);
      if (res.data.success) {
        setSaves(res.data.saves || []);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.totalResults || 0);
        setHasNextPage(res.data.hasNextPage || false);
      }
    } catch (err) {
      console.error("Failed to load saved trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchSaves(newPage);
    }
  };

  const handleUnsaveCallback = (tripId) => {
    // Optimistic UI update: Remove from saves list directly on unsave
    setSaves((prev) => prev.filter((save) => save.trip?._id !== tripId));
    setTotalResults((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="dashboard-page min-vh-100 text-light py-5">
      <div className="container">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
          <div>
            <h1 className="section-title m-0 text-white fw-bold display-5">
              Saved Trips ⭐
            </h1>
            <p className="dashboard-subtitle m-0 text-secondary mt-1">
              Your curated list of bookmarks, trip plans, and shared itineraries.
            </p>
            <small className="text-warning fw-semibold">
              {totalResults} saved {totalResults === 1 ? "adventure" : "adventures"} found
            </small>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? "btn-warning text-dark" : "btn-outline-warning"}`}
            style={{ borderRadius: "20px", fontWeight: "600" }}
          >
            ⚙️ {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* SEARCH & FILTERS BOX */}
        <div
          className="glass-card p-4 mb-5"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
          }}
        >
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-8">
              <input
                type="text"
                placeholder="Search by destination or title..."
                className="form-control trip-search-input py-2.5 px-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 d-flex gap-2">
              <button
                className="btn btn-outline-secondary w-100 rounded-pill"
                onClick={() => {
                  setSearch("");
                  setBudgetMax("");
                  setTravelStyle("");
                  setStatus("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="row g-3 mt-3 pt-3 border-top border-secondary border-opacity-25">
              {/* BUDGET FILTER */}
              <div className="col-12 col-md-4">
                <label className="text-secondary small fw-bold mb-2">Max Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  className="form-control text-light"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                  }}
                />
              </div>

              {/* TRAVEL STYLE */}
              <div className="col-12 col-md-4">
                <label className="text-secondary small fw-bold mb-2">Travel Style</label>
                <select
                  className="form-select text-light"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                  }}
                >
                  <option value="" className="bg-dark text-light">All Styles</option>
                  <option value="Adventure" className="bg-dark text-light">Adventure 🎒</option>
                  <option value="Leisure" className="bg-dark text-light">Leisure 🏖️</option>
                  <option value="Budget" className="bg-dark text-light">Budget 💸</option>
                  <option value="Luxury" className="bg-dark text-light">Luxury 💎</option>
                  <option value="Cultural" className="bg-dark text-light">Cultural 🏛️</option>
                  <option value="Solo" className="bg-dark text-light">Solo 🌍</option>
                </select>
              </div>

              {/* STATUS */}
              <div className="col-12 col-md-4">
                <label className="text-secondary small fw-bold mb-2">Trip Status</label>
                <select
                  className="form-select text-light"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                  }}
                >
                  <option value="" className="bg-dark text-light">All Statuses</option>
                  <option value="upcoming" className="bg-dark text-light">Upcoming</option>
                  <option value="active" className="bg-dark text-light">Active</option>
                  <option value="completed" className="bg-dark text-light">Completed</option>
                  <option value="cancelled" className="bg-dark text-light">Cancelled</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* LOADING BOX */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : saves.length === 0 ? (
          /* EMPTY STATE */
          <div
            className="glass-card text-center p-5 mx-auto"
            style={{
              maxWidth: "580px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "24px",
            }}
          >
            <span style={{ fontSize: "64px" }}>🌍</span>
            <h3 className="text-warning mt-4 fw-bold">No Saved Adventures</h3>
            <p className="text-secondary mt-2 mb-4">
              Explore upcoming public trips, co-plan budgets with matches, and click the star bookmark to curate your wishlist!
            </p>
            <Link to="/trips" className="btn btn-warning px-5 rounded-pill fw-bold text-dark text-decoration-none">
              Explore Active Trips ✈️
            </Link>
          </div>
        ) : (
          /* CARDS LIST */
          <>
            <div className="row g-4">
              {saves.map((save) => {
                const trip = save.trip;
                if (!trip) return null; // Safe guard for deleted trips

                const savedDate = new Date(save.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={save._id} className="col-12 col-md-6 col-lg-4">
                    <div
                      className="trip-card glass-card h-100 d-flex flex-column"
                      style={{
                        background: "linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "20px",
                        overflow: "hidden",
                      }}
                    >
                      {/* IMAGE WRAPPER */}
                      <div className="position-relative" style={{ height: "200px" }}>
                        {trip.image ? (
                          <img
                            src={trip.image.startsWith("http") ? trip.image : `http://localhost:5000/${trip.image}`}
                            alt={trip.title}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div
                            className="w-100 h-100 bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-secondary"
                            style={{ fontSize: "16px" }}
                          >
                            📷 No Trip Cover
                          </div>
                        )}
                        <span
                          className="position-absolute top-3 end-3 badge px-3 py-1.5 rounded-pill text-capitalize"
                          style={{
                            background:
                              trip.status === "upcoming"
                                ? "rgba(13, 202, 240, 0.85)"
                                : trip.status === "active"
                                ? "rgba(25, 135, 84, 0.85)"
                                : "rgba(108, 117, 125, 0.85)",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {trip.status}
                        </span>
                      </div>

                      {/* CONTENT BODY */}
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <span className="text-secondary small d-block mb-1">
                          Saved on {savedDate}
                        </span>
                        <h4 className="fw-bold text-white text-truncate mb-2" title={trip.title}>
                          {trip.title}
                        </h4>
                        <p className="text-warning fw-semibold mb-3 small">
                          📍 {trip.destination}
                        </p>

                        <div className="d-flex justify-content-between text-secondary small pt-3 border-top border-secondary border-opacity-25 mb-4">
                          <span>💰 Budget: <b>₹{trip.budget?.toLocaleString()}</b></span>
                          <span>📅 {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : (trip.date ? new Date(trip.date).toLocaleDateString() : "TBD")}</span>
                        </div>

                        {/* HOST */}
                        <div className="d-flex align-items-center gap-3 p-2 rounded mb-4" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
                          <Avatar src={trip.createdBy?.profileImage} size={36} />
                          <div>
                            <span className="text-secondary block" style={{ fontSize: "10px" }}>HOSTED BY</span>
                            <h6 className="m-0 small fw-bold text-white">{trip.createdBy?.name || "Unknown Host"}</h6>
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="mt-auto d-flex justify-content-between align-items-center gap-2 pt-2 border-top border-secondary border-opacity-10">
                          <Link
                            to={`/trip/${trip._id}`}
                            className="btn btn-outline-warning btn-sm px-3 py-2 fw-semibold text-decoration-none"
                            style={{ borderRadius: "20px" }}
                          >
                            👁️ View Details
                          </Link>
                          
                          <div className="d-flex gap-2">
                            <SaveButton
                              tripId={trip._id}
                              initialSaved={true}
                              initialCount={trip.savesCount}
                              onToggle={() => handleUnsaveCallback(trip._id)}
                            />
                            <ShareButton
                              tripId={trip._id}
                              tripTitle={trip.title}
                              tripDestination={trip.destination}
                              initialCount={trip.sharesCount}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                <button
                  className="btn btn-outline-light rounded-pill px-4"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="text-secondary small fw-bold">
                  Page <b>{page}</b> of <b>{totalPages}</b>
                </span>
                <button
                  className="btn btn-outline-light rounded-pill px-4"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SavedTrips;
