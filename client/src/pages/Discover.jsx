import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Avatar from "../components/shared/Avatar";

export function Discover() {
  const navigate = useNavigate();

  // Search, filter, and sort states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [personality, setPersonality] = useState("");
  const [destinationPreference, setDestinationPreference] = useState("");
  const [minTrustScore, setMinTrustScore] = useState("");
  const [minCompletion, setMinCompletion] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [minFollowing, setMinFollowing] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  // Pagination states
  const [travelers, setTravelers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Current logged in user (to check self)
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Timeout ref for debouncing
  const debounceTimeoutRef = useRef(null);

  // Handlers for search input debounce (300-500ms)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Fetch data
  const fetchTravelers = useCallback(
    async (currentPage, isNewSearch = false) => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 12,
          query: debouncedQuery,
          travelStyle,
          personality,
          destinationPreference,
          minTrustScore,
          minCompletion,
          minFollowers,
          minFollowing,
          sortBy,
        };

        // Clean empty parameters
        Object.keys(params).forEach(
          (key) => (params[key] === "" || params[key] === null) && delete params[key]
        );

        const res = await API.get("/profile/discover", { params });
        const { travelers: fetchedTravelers, hasNextPage: hasNext, totalResults: total } = res.data;

        if (isNewSearch) {
          setTravelers(fetchedTravelers);
        } else {
          // Prevent duplicates by checking if ID is already in list
          setTravelers((prev) => {
            const existingIds = new Set(prev.map((t) => t._id));
            const newFiltered = fetchedTravelers.filter((t) => !existingIds.has(t._id));
            return [...prev, ...newFiltered];
          });
        }

        setHasNextPage(hasNext);
        setTotalResults(total);
      } catch (err) {
        console.error("Failed to discover travelers:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedQuery,
      travelStyle,
      personality,
      destinationPreference,
      minTrustScore,
      minCompletion,
      minFollowers,
      minFollowing,
      sortBy,
    ]
  );

  // Trigger search on query/filters change
  useEffect(() => {
    setPage(1);
    fetchTravelers(1, true);
  }, [fetchTravelers]);

  // Infinite Scroll Listener
  const handleScroll = useCallback(() => {
    if (loading || !hasNextPage) return;

    const threshold = 150;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (documentHeight - (scrollTop + windowHeight) < threshold) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchTravelers(nextPage, false);
        return nextPage;
      });
    }
  }, [loading, hasNextPage, fetchTravelers]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handle follow / unfollow toggle
  const handleFollowToggle = async (targetId, currentFollowingState) => {
    try {
      // Optimistic update
      setTravelers((prev) =>
        prev.map((t) => {
          if (t._id === targetId) {
            const countAdjust = currentFollowingState ? -1 : 1;
            return {
              ...t,
              isFollowing: !currentFollowingState,
              followersCount: Math.max(0, (t.followersCount || 0) + countAdjust),
            };
          }
          return t;
        })
      );

      const endpoint = currentFollowingState
        ? `/profile/unfollow/${targetId}`
        : `/profile/follow/${targetId}`;

      await API.post(endpoint);
    } catch (err) {
      console.error("Follow action failed:", err);
      // Revert state on error
      setPage(1);
      fetchTravelers(1, true);
    }
  };

  // Clear all filters
  const resetFilters = () => {
    setQuery("");
    setTravelStyle("");
    setPersonality("");
    setDestinationPreference("");
    setMinTrustScore("");
    setMinCompletion("");
    setMinFollowers("");
    setMinFollowing("");
    setSortBy("relevance");
  };

  return (
    <div className="dashboard-page min-vh-100 text-light py-5" style={{ background: "#111" }}>
      <div className="container">
        
        {/* HEADER BAR */}
        <div className="glass-card p-4 mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold m-0 text-warning">🔍 Discover Travelers</h2>
              <p className="text-secondary m-0" style={{ fontSize: "14px" }}>
                Find like-minded wanderers, check trust scores, and follow their adventures.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn ${showFilters ? "btn-warning" : "btn-outline-warning"} d-flex align-items-center gap-2`}
                onClick={() => setShowFilters(!showFilters)}
              >
                ⚙️ Filters {showFilters ? "Open" : "Closed"}
              </button>
              <button className="btn btn-outline-secondary" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>

          {/* MAIN SEARCH & SORT INPUTS */}
          <div className="row g-3 mt-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">🔍</span>
                <input
                  type="text"
                  className="form-control bg-black text-light border-secondary shadow-none"
                  placeholder="Search by name, interest (e.g. hiking), travel style, destination..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">Sort:</span>
                <select
                  className="form-select bg-black text-light border-secondary shadow-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="trust">Highest Trust Score</option>
                  <option value="completion">Profile Strength</option>
                  <option value="followed">Most Followed</option>
                  <option value="newest">Newest Travelers</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER LAYOUT */}
        <div className="row g-4">
          {/* FILTERS DRAWER / SIDE PANEL */}
          {showFilters && (
            <div className="col-lg-3">
              <div
                className="glass-card p-4 sticky-top"
                style={{ top: "90px", zIndex: 10, background: "#181818" }}
              >
                <h5 className="fw-bold mb-4 text-warning">Filter Preferences</h5>

                {/* Destination Filter */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Destination Preference
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-black text-light border-secondary"
                    placeholder="e.g. Paris"
                    value={destinationPreference}
                    onChange={(e) => setDestinationPreference(e.target.value)}
                  />
                </div>

                {/* Travel Style Filter */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Travel Style
                  </label>
                  <select
                    className="form-select form-select-sm bg-black text-light border-secondary"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                  >
                    <option value="">Any Style</option>
                    <option value="Backpacker">Backpacker</option>
                    <option value="Luxury Traveler">Luxury Traveler</option>
                    <option value="Solo Adventurer">Solo Adventurer</option>
                    <option value="Foodie Wanderer">Foodie Wanderer</option>
                    <option value="Adventure Seeker">Adventure Seeker</option>
                    <option value="Budget Explorer">Budget Explorer</option>
                  </select>
                </div>

                {/* Personality Filter */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Personality type
                  </label>
                  <select
                    className="form-select form-select-sm bg-black text-light border-secondary"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                  >
                    <option value="">Any Personality</option>
                    <option value="Extroverted">Extroverted</option>
                    <option value="Introverted">Introverted</option>
                    <option value="Spontaneous">Spontaneous</option>
                    <option value="Planner">Planner</option>
                    <option value="Relaxed">Relaxed</option>
                  </select>
                </div>

                {/* Trust Score Bounds */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Minimum Trust Score ({minTrustScore || "10"})
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="100"
                    step="10"
                    value={minTrustScore || 10}
                    onChange={(e) => setMinTrustScore(e.target.value)}
                  />
                </div>

                {/* Profile Completion Bounds */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Minimum Completion ({minCompletion || "0"}%)
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="100"
                    step="10"
                    value={minCompletion || 0}
                    onChange={(e) => setMinCompletion(e.target.value)}
                  />
                </div>

                {/* Minimum Followers */}
                <div className="mb-3">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Min Followers ({minFollowers || "0"})
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm bg-black text-light border-secondary"
                    placeholder="e.g. 5"
                    min="0"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                  />
                </div>

                {/* Minimum Following */}
                <div className="mb-4">
                  <label className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                    Min Following ({minFollowing || "0"})
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm bg-black text-light border-secondary"
                    placeholder="e.g. 5"
                    min="0"
                    value={minFollowing}
                    onChange={(e) => setMinFollowing(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-outline-warning w-100 btn-sm"
                  onClick={() => resetFilters()}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* RESULTS GRID CONTAINER */}
          <div className={showFilters ? "col-lg-9" : "col-12"}>
            {travelers.length === 0 && !loading ? (
              <div className="glass-card text-center py-5">
                <h4 className="text-secondary">No travelers found matching your criteria</h4>
                <p className="text-muted" style={{ fontSize: "14px" }}>
                  Try adjusting filters or typing another query.
                </p>
                <button className="btn btn-sm btn-warning mt-2" onClick={resetFilters}>
                  Reset All Settings
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {travelers.map((item) => {
                  const isSelf = item._id === currentUser._id;
                  const score = item.trustScore || 10;
                  const trustColor = score >= 80 ? "success" : score >= 50 ? "warning" : "danger";

                  return (
                    <div
                      className={showFilters ? "col-md-6 col-xl-4" : "col-md-6 col-lg-4 col-xl-3"}
                      key={item._id}
                    >
                      <div
                        className="glass-card p-3 h-100 d-flex flex-column justify-content-between text-center position-relative overflow-hidden"
                        style={{ background: "#1a1a1a", border: "1px solid rgba(255, 255, 255, 0.05)" }}
                      >
                        {/* Cover gradient accent */}
                        <div
                          style={{
                            height: "50px",
                            margin: "-16px -16px 15px -16px",
                            background: "linear-gradient(135deg, #fb8500, #ffb703)",
                            opacity: 0.15,
                          }}
                        />

                        {/* Top section: Avatar and basic details */}
                        <div>
                          <Avatar
                            src={item.profileImage}
                            alt="avatar"
                            size={72}
                            className="shadow-sm border border-2 border-dark"
                          />

                          <h5 className="fw-bold mt-2 mb-1 text-white text-truncate">
                            {item.name}
                            {item.isVerified && (
                              <span
                                className="ms-1 badge bg-success"
                                style={{ fontSize: "9px", padding: "2px 4px" }}
                              >
                                ✓
                              </span>
                            )}
                          </h5>

                          <div className="d-flex justify-content-center gap-1 flex-wrap mb-3">
                            {item.travelStyle && (
                              <span className="badge bg-secondary" style={{ fontSize: "10px" }}>
                                {item.travelStyle}
                              </span>
                            )}
                            {item.destinationPreference && (
                              <span className="badge bg-warning text-dark" style={{ fontSize: "10px" }}>
                                📍 {item.destinationPreference}
                              </span>
                            )}
                          </div>

                          {/* Stats stats panel */}
                          <div
                            className="row g-2 py-2 mb-3 rounded"
                            style={{ background: "rgba(0, 0, 0, 0.25)" }}
                          >
                            <div className="col-6">
                              <small className="text-secondary d-block" style={{ fontSize: "10px" }}>
                                Followers
                              </small>
                              <span className="fw-bold text-white" style={{ fontSize: "13px" }}>
                                {item.followersCount || 0}
                              </span>
                            </div>
                            <div className="col-6">
                              <small className="text-secondary d-block" style={{ fontSize: "10px" }}>
                                Following
                              </small>
                              <span className="fw-bold text-white" style={{ fontSize: "13px" }}>
                                {item.followingCount || 0}
                              </span>
                            </div>
                          </div>

                          {/* Trust Score & Profile Strength */}
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-secondary">Trust score</small>
                            <span className={`fw-bold text-${trustColor}`} style={{ fontSize: "12px" }}>
                              {score}/100
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <small className="text-secondary">Profile Strength</small>
                            <span className="fw-bold text-warning" style={{ fontSize: "12px" }}>
                              {item.profileCompletion || 0}%
                            </span>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="d-flex gap-2 mt-auto">
                          {!isSelf && (
                            <button
                              className={`btn btn-sm ${
                                item.isFollowing ? "btn-outline-warning" : "btn-warning"
                              } flex-grow-1 fw-semibold`}
                              onClick={() => handleFollowToggle(item._id, item.isFollowing)}
                            >
                              {item.isFollowing ? "Following" : "Follow"}
                            </button>
                          )}
                          <Link
                            to={`/profile/${item._id}`}
                            className={`btn btn-sm btn-outline-light ${isSelf ? "w-100" : ""}`}
                          >
                            View
                          </Link>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LOADING SPINNER */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status" />
                <p className="text-muted mt-2" style={{ fontSize: "13px" }}>
                  Discovering matching travelers...
                </p>
              </div>
            )}

            {/* END OF LIST NOTICE */}
            {!hasNextPage && travelers.length > 0 && !loading && (
              <div className="text-center text-muted py-4">
                <small>Reached the end of traveler list. ✈️</small>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Discover;
