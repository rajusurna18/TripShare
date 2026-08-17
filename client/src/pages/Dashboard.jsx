import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import API from "../services/api";

import StatCard
  from "../components/dashboard/StatCard";

import Avatar from "../components/shared/Avatar";
import ActivityCard from "../components/activity/ActivityCard";

function Dashboard() {

  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);

  const [dashboardStats, setDashboardStats] =
    useState(null);

  const [activities, setActivities] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedTotalPages, setFeedTotalPages] = useState(1);
  const [loadingFeed, setLoadingFeed] = useState(false);

  useEffect(() => {

    fetchTrips();

    fetchProfile();

    fetchDashboardStats();

    fetchFeed(1);

  }, []);

  // FETCH TRIPS

  async function fetchTrips() {

    try {

      const token =
        localStorage.getItem("token");

      const res = await API.get(
        "/trips",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setTrips(
        Array.isArray(res.data.trips)
          ? res.data.trips
          : []
      );

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);

    }

  };

  // FETCH PROFILE

  async function fetchProfile() {

    try {

      const token =
        localStorage.getItem("token");

      const res = await API.get(
        "/profile?simple=true",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  //fetch dashboardstats

  async function fetchDashboardStats() {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            "/dashboard",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setDashboardStats(

          res.data.stats

        );

      } catch (err) {

        console.log(err);

      }

    };

  // FETCH PERSONALIZED FEED
  async function fetchFeed(pageNum = 1) {
    try {
      setLoadingFeed(true);
      const token = localStorage.getItem("token");
      const res = await API.get(`/activities?feedType=dashboard&page=${pageNum}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (pageNum === 1) {
        setActivities(res.data.activities || []);
      } else {
        setActivities((prev) => [...prev, ...(res.data.activities || [])]);
      }
      setFeedPage(res.data.page);
      setFeedTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch dashboard feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // STATS

  const uniqueDestinations =
    new Set(
      (Array.isArray(trips)
        ? trips
        : []
      ).map(
        (trip) =>
          trip.destination
      )
    ).size;

  const totalTravelers =
    trips.reduce(

      (total, trip) =>

        total +
        (
          trip.members?.length || 0
        ),

      0

    );

  const totalBudget =
    trips.reduce(

      (sum, trip) =>

        sum +
        (trip.budget || 0),

      0

    );

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <div className="text-center">

          <div
            className="spinner-border text-warning mb-3"
          />

          <h4>

            Loading Dashboard...

          </h4>

        </div>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">
      <div className="container container-responsive py-5">

        {/* HERO */}

        <div className="dashboard-header mb-5">

          <div className="row align-items-center g-4">

            {/* LEFT */}

            <div className="col-lg-8">

              <h1 className="fw-bold display-5 text-white">

                Welcome Back{" "}

                <span className="text-warning">

                  {user?.name || "Traveler"}

                </span>

                🌍

              </h1>

              <p className="dashboard-subtitle">

                Plan smarter trips,
                connect with travelers,
                and explore the world
                with TripShare AI.

              </p>

            </div>

          </div>

        </div>

        {/* EMPTY STATE */}

        {

          !loading && trips.length === 0 && (

            <div className="glass-card p-5 text-center mb-5">

              <h2 className="text-warning mb-3">

                No Trips Yet ✈️

              </h2>

              <p className="dashboard-text mb-4">

                Start your first adventure
                and explore the world
                with TripShare AI.

              </p>

              <Link
                to="/create-trip"
                className="btn btn-custom btn-responsive"
              >

                Create Your First Trip

              </Link>

            </div>

          )

        }

        {

          trips.length > 0 && (

            <>

              {/* TOP SECTION */}

              <div className="row g-4 mb-5">

                {/* LEFT */}

                <div className="col-lg-8 d-flex flex-column gap-4">

                  {/* ACTIVE TRIPS */}

                  <div className="special-card glass-card p-4 view-trip-card">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                      <div>

                        <h2 className="text-warning mb-2">

                          ✈️ Your Active Trips

                        </h2>

                        <p className="dashboard-text m-0">

                          Manage your trips and
                          continue your travel journey.

                        </p>

                        {/* MINI TRIP PREVIEW */}

                        <div className="mini-trip-preview mt-3">

                          {

                            trips.slice(0, 2).map(
                              (trip, index) => (

                                <div
                                  key={index}
                                  className="mini-trip-item"
                                >

                                  🌍 {trip.destination}

                                  <span>

                                    ₹{trip.budget}

                                  </span>

                                </div>

                              )
                            )

                          }

                        </div>

                      </div>

                      <Link
                        to="/trips"
                        className="btn btn-custom btn-responsive mt-3 mt-sm-0"
                      >

                        Open Trips →

                      </Link>

                    </div>

                  </div>

                  {/* QUICK ACTIONS */}

                  <div className="quick-actions">

                    <Link
                      to="/create-trip"
                      className="quick-action-btn"
                    >
                      ✈️ Create Trip
                    </Link>

                    {/* AI ASSISTANT */}

                    <Link
                      to="/ai"
                      className="quick-action-btn"
                    >
                      🤖 AI Assistant
                    </Link>

                    {/* AI PLANNER */}

                    <Link
                      to="/itinerary"
                      className="quick-action-btn"
                    >
                      ✨ AI Planner
                    </Link>

                    {/* EXPENSES */}

                    <Link
                      to={
                        trips.length > 0
                          ? `/expenses/${trips[0]._id}`
                          : "/trips"
                      }
                      className="quick-action-btn"
                    >
                      💸 Expenses
                    </Link>

                    <Link
                      to="/recommendations"
                      className="quick-action-btn"
                    >
                      🤖 AI Trips
                    </Link>

                  </div>

                </div>

                {/* STATS */}

                <div className="col-lg-4">

                  <div className="special-card glass-card h-100 p-4">

                    <h3 className="text-warning mb-4">

                      📊 Travel Stats

                    </h3>

                    <div className="d-flex flex-column gap-3">

                      <div className="stats-row">

                        ✈ Trips Created

                        <span>

                          {trips.length}

                        </span>

                      </div>

                      <div className="stats-row">

                        🌍 Destinations

                        <span>

                          {uniqueDestinations}

                        </span>

                      </div>

                      <div className="stats-row">

                        👥 Travelers

                        <span>

                          {totalTravelers}

                        </span>

                      </div>

                      <div className="stats-row">

                        💰 Shared Budget

                        <span>

                          ₹{totalBudget}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* FEATURES */}

              <div className="row g-4 mb-5">

                {/* SMART MATCHES */}

                <div className="col-lg-6">

                  <Link
                    to="/matches"
                    className="dashboard-box feature-box h-100 text-decoration-none"
                  >

                    <div className="feature-icon">

                      👥

                    </div>

                    <div className="feature-content">

                      <h2>

                        Smart Travel Matches

                      </h2>

                      <p>

                        Discover compatible travelers
                        based on interests,
                        budget, destinations,
                        and travel personality.

                      </p>

                      <span className="feature-tag">

                        AI Match System Beta 🚀

                      </span>

                    </div>

                  </Link>

                </div>

                {/* GROUP CHAT */}

                <div className="col-lg-6">

                  <Link

                    to={`/chat/${trips[0]?._id}`}

                    className="dashboard-box feature-box h-100 text-decoration-none"

                  >

                    <div className="feature-icon">

                      💬

                    </div>

                    <div className="feature-content">

                      <h2>

                        Group Travel Chat

                      </h2>

                      <p>

                        Open live trip discussions,
                        coordinate plans,
                        and connect with travelers instantly.

                      </p>

                      <span className="feature-tag">

                        Live Messaging Experience

                      </span>

                      <div className="mt-3">

                        <small className="text-secondary">

                          Last active: 2 mins ago

                        </small>

                      </div>

                    </div>

                  </Link>

                </div>

              </div>

              {/* BLOG WIDGETS SECTION */}
              {dashboardStats?.widgets && (
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold m-0 text-white">✍️ Your Travel Journals</h2>
                    <Link to="/create-blog" className="btn btn-warning btn-sm px-3 fw-bold rounded-pill text-dark text-decoration-none">
                      + New Blog Post
                    </Link>
                  </div>

                  <div className="row g-3">
                    {/* LATEST BLOG */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Latest Article ⏱️</small>
                        {dashboardStats.widgets.latestBlog ? (
                          <div className="mt-2 d-flex flex-column flex-grow-1">
                            <Link to={`/blog/${dashboardStats.widgets.latestBlog._id}`} className="text-decoration-none text-light hover-warning">
                              <h6 className="fw-bold text-truncate mb-2 text-white">{dashboardStats.widgets.latestBlog.title}</h6>
                            </Link>
                            <p className="text-secondary small flex-grow-1 text-truncate mb-3" style={{ fontSize: "0.8rem" }}>
                              📍 {dashboardStats.widgets.latestBlog.destination}
                            </p>
                            <div className="d-flex justify-content-between text-secondary pt-2 border-top border-secondary border-opacity-20" style={{ fontSize: "0.7rem" }}>
                              <span>👁️ {dashboardStats.widgets.latestBlog.viewsCount || 0} views</span>
                              <span>❤️ {dashboardStats.widgets.latestBlog.likesCount || 0} likes</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-secondary small italic mt-3 mb-0">No posts written yet.</p>
                        )}
                      </div>
                    </div>

                    {/* POPULAR BLOG */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Most Popular 🔥</small>
                        {dashboardStats.widgets.popularBlog ? (
                          <div className="mt-2 d-flex flex-column flex-grow-1">
                            <Link to={`/blog/${dashboardStats.widgets.popularBlog._id}`} className="text-decoration-none text-light hover-warning">
                              <h6 className="fw-bold text-truncate mb-2 text-white">{dashboardStats.widgets.popularBlog.title}</h6>
                            </Link>
                            <p className="text-secondary small flex-grow-1 text-truncate mb-3" style={{ fontSize: "0.8rem" }}>
                              📍 {dashboardStats.widgets.popularBlog.destination}
                            </p>
                            <div className="d-flex justify-content-between text-secondary pt-2 border-top border-secondary border-opacity-20" style={{ fontSize: "0.7rem" }}>
                              <span>👁️ {dashboardStats.widgets.popularBlog.viewsCount || 0} views</span>
                              <span>❤️ {dashboardStats.widgets.popularBlog.likesCount || 0} likes</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-secondary small italic mt-3 mb-0">No popular posts yet.</p>
                        )}
                      </div>
                    </div>

                    {/* MOST VIEWED BLOG */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Most Viewed 👁️</small>
                        {dashboardStats.widgets.mostViewedBlog ? (
                          <div className="mt-2 d-flex flex-column flex-grow-1">
                            <Link to={`/blog/${dashboardStats.widgets.mostViewedBlog._id}`} className="text-decoration-none text-light hover-warning">
                              <h6 className="fw-bold text-truncate mb-2 text-white">{dashboardStats.widgets.mostViewedBlog.title}</h6>
                            </Link>
                            <p className="text-secondary small flex-grow-1 text-truncate mb-3" style={{ fontSize: "0.8rem" }}>
                              📍 {dashboardStats.widgets.mostViewedBlog.destination}
                            </p>
                            <div className="d-flex justify-content-between text-secondary pt-2 border-top border-secondary border-opacity-20" style={{ fontSize: "0.7rem" }}>
                              <span>👁️ {dashboardStats.widgets.mostViewedBlog.viewsCount || 0} views</span>
                              <span>❤️ {dashboardStats.widgets.mostViewedBlog.likesCount || 0} likes</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-secondary small italic mt-3 mb-0">No views recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* RECENT DRAFT */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <small className="text-warning fw-semibold text-uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Recent Draft 🔒</small>
                        {dashboardStats.widgets.recentDraft ? (
                          <div className="mt-2 d-flex flex-column flex-grow-1">
                            <Link to={`/blog/${dashboardStats.widgets.recentDraft._id}`} className="text-decoration-none text-light hover-warning">
                              <h6 className="fw-bold text-truncate mb-2 text-white">{dashboardStats.widgets.recentDraft.title}</h6>
                            </Link>
                            <p className="text-secondary small flex-grow-1 text-truncate mb-3" style={{ fontSize: "0.8rem" }}>
                              📍 {dashboardStats.widgets.recentDraft.destination}
                            </p>
                            <div className="d-flex justify-content-between text-secondary pt-2 border-top border-secondary border-opacity-20" style={{ fontSize: "0.7rem" }}>
                              <span>👁️ {dashboardStats.widgets.recentDraft.viewsCount || 0} views</span>
                              <span>❤️ {dashboardStats.widgets.recentDraft.likesCount || 0} likes</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-secondary small italic mt-3 mb-0">No active drafts saved.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* SOCIAL ACTIVITY FEED */}
              <div className="mt-5 mb-4">
                <h2 className="text-warning fw-bold mb-4">📢 Social Feed Updates</h2>
                {activities.length === 0 && !loadingFeed ? (
                  <div className="glass-card p-4 text-center">
                    <p className="text-secondary mb-0">No travel updates from users you follow yet. Explore the Home page feed or follow fellow travelers!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {activities.map((activity) => (
                      <ActivityCard key={activity._id} activity={activity} />
                    ))}
                    {feedPage < feedTotalPages && (
                      <div className="text-center mt-3">
                        <button
                          className="btn btn-outline-warning fw-bold px-4 py-2"
                          disabled={loadingFeed}
                          onClick={() => fetchFeed(feedPage + 1)}
                          style={{ borderRadius: "8px" }}
                        >
                          {loadingFeed ? "Syncing..." : "Load More Activity"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>


              {/* LATEST WIDGETS SECTION */}
              {dashboardStats?.widgets && (
                <div className="mt-5 mb-5">
                  <h2 className="text-warning fw-bold mb-4">⚡ Latest Activities & Connections</h2>
                  <div className="row g-4">
                    
                    {/* LATEST TRIP */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <small className="text-warning fw-bold text-uppercase d-block mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Latest Trip ✈️</small>
                          {dashboardStats.widgets.latestTrip ? (
                            <div>
                              <h5 className="fw-bold text-white text-truncate mb-1">{dashboardStats.widgets.latestTrip.title}</h5>
                              <p className="text-secondary small mb-2">📍 {dashboardStats.widgets.latestTrip.destination}</p>
                              <span className="badge bg-warning text-dark mb-3" style={{ fontSize: "11px" }}>{dashboardStats.widgets.latestTrip.status}</span>
                            </div>
                          ) : (
                            <p className="text-secondary small italic my-3">No trips recorded yet.</p>
                          )}
                        </div>
                        {dashboardStats.widgets.latestTrip && (
                          <Link to={`/trip/${dashboardStats.widgets.latestTrip._id}`} className="btn btn-sm btn-outline-warning w-100 py-2 rounded-3 fw-bold mt-2">
                            Quick Open →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* LATEST FRIEND */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between align-items-center text-center">
                        <div className="w-100">
                          <small className="text-warning fw-bold text-uppercase d-block mb-3 text-start" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>New Connection 🤝</small>
                          {dashboardStats.widgets.latestFriend ? (
                            <div className="d-flex flex-column align-items-center">
                              <Avatar src={dashboardStats.widgets.latestFriend.profileImage} alt={dashboardStats.widgets.latestFriend.name} size={64} className="mb-2 border border-warning" />
                              <h6 className="fw-bold text-white mb-1">{dashboardStats.widgets.latestFriend.name}</h6>
                              <p className="text-secondary small mb-0">Connected Traveler</p>
                            </div>
                          ) : (
                            <p className="text-secondary small italic my-3">No mutual connections.</p>
                          )}
                        </div>
                        {dashboardStats.widgets.latestFriend && (
                          <Link to={`/profile/${dashboardStats.widgets.latestFriend._id}`} className="btn btn-sm btn-outline-warning w-100 py-2 rounded-3 fw-bold mt-2">
                            View Profile
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* LATEST REVIEW */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <small className="text-warning fw-bold text-uppercase d-block mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Latest Review ⭐</small>
                          {dashboardStats.widgets.latestReview ? (
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <Avatar src={dashboardStats.widgets.latestReview.createdBy?.profileImage} alt={dashboardStats.widgets.latestReview.createdBy?.name} size={28} />
                                <span className="small fw-semibold">{dashboardStats.widgets.latestReview.createdBy?.name}</span>
                              </div>
                              <div className="text-warning mb-1" style={{ fontSize: "13px" }}>
                                {"★".repeat(dashboardStats.widgets.latestReview.rating)}{"☆".repeat(5 - dashboardStats.widgets.latestReview.rating)}
                              </div>
                              <p className="text-secondary small text-truncate mb-0">"{dashboardStats.widgets.latestReview.comment}"</p>
                            </div>
                          ) : (
                            <p className="text-secondary small italic my-3">No reviews received.</p>
                          )}
                        </div>
                        {dashboardStats.widgets.latestReview?.trip && (
                          <small className="text-muted text-truncate d-block mt-3 border-top border-secondary border-opacity-10 pt-2">Trip: {dashboardStats.widgets.latestReview.trip.title}</small>
                        )}
                      </div>
                    </div>

                    {/* LATEST MEMORY */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <small className="text-warning fw-bold text-uppercase d-block mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Latest Memory 📸</small>
                          {dashboardStats.widgets.latestMemory ? (
                            <div>
                              <img src={dashboardStats.widgets.latestMemory.image} alt="Memory" className="img-fluid rounded-3 mb-2 border border-secondary border-opacity-15" style={{ height: "90px", width: "100%", objectFit: "cover" }} />
                              <p className="small text-white text-truncate mb-0">{dashboardStats.widgets.latestMemory.caption || "Travel snapshot"}</p>
                            </div>
                          ) : (
                            <p className="text-secondary small italic my-3">No memories posted yet.</p>
                          )}
                        </div>
                        {dashboardStats.widgets.latestMemory?.trip && (
                          <small className="text-muted text-truncate d-block mt-2">Trip: {dashboardStats.widgets.latestMemory.trip.title}</small>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ANALYTICS SECTION */}
              {dashboardStats?.analytics && (
                <div className="mt-5 mb-5">
                  <h2 className="text-warning fw-bold mb-4">📊 Travel Analytics Dashboard</h2>
                  <div className="row g-4">
                    
                    {/* TRIPS MONTHLY COMPARISON */}
                    <div className="col-12 col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold text-warning mb-3">✈️ Trips Created vs Joined</h5>
                        <p className="text-secondary small mb-4">Comparison of trips organized by you vs joined as a teammate.</p>
                        <div className="d-flex justify-content-between align-items-end" style={{ height: "200px" }}>
                          {(() => {
                            const months = [];
                            for (let i = 5; i >= 0; i--) {
                              const d = new Date();
                              d.setMonth(d.getMonth() - i);
                              months.push(d.toISOString().substring(0, 7));
                            }
                            const trendData = months.map(m => {
                              const c = dashboardStats.analytics.tripsTrendCreated?.find(t => t._id === m)?.count || 0;
                              const j = dashboardStats.analytics.tripsTrendJoined?.find(t => t._id === m)?.count || 0;
                              const [year, month] = m.split("-");
                              const mName = new Date(year, parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' });
                              return { month: mName, created: c, joined: j };
                            });
                            const maxVal = Math.max(...trendData.map(d => Math.max(d.created, d.joined)), 1);

                            return trendData.map((d, idx) => (
                              <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: "100%" }}>
                                <div className="d-flex align-items-end justify-content-center gap-2 w-100 h-100 pb-2">
                                  <div className="bg-warning rounded-top" style={{ height: `${(d.created / maxVal) * 100}%`, width: "14px", minHeight: d.created > 0 ? "4px" : "0px" }} title={`Created: ${d.created}`} />
                                  <div className="bg-success rounded-top" style={{ height: `${(d.joined / maxVal) * 100}%`, width: "14px", minHeight: d.joined > 0 ? "4px" : "0px" }} title={`Joined: ${d.joined}`} />
                                </div>
                                <small className="text-secondary" style={{ fontSize: "10px" }}>{d.month}</small>
                              </div>
                            ));
                          })()}
                        </div>
                        <div className="d-flex justify-content-center gap-4 mt-4 border-top border-secondary border-opacity-10 pt-3">
                          <div className="d-flex align-items-center gap-2 small text-secondary">
                            <div className="bg-warning rounded" style={{ width: "10px", height: "10px" }}></div> Created
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-secondary">
                            <div className="bg-success rounded" style={{ width: "10px", height: "10px" }}></div> Joined
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EXPENSE CATEGORY BREAKDOWN */}
                    <div className="col-12 col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold text-warning mb-3">💸 Category Spending Shares</h5>
                        <p className="text-secondary small mb-4">Distribution of expenses paid by you across trip categories.</p>
                        
                        {dashboardStats.analytics.expenseCategoryStats?.length === 0 ? (
                          <div className="text-center py-5">
                            <p className="text-secondary small italic mb-0">No expense records found.</p>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {dashboardStats.analytics.expenseCategoryStats.slice(0, 5).map((item, idx) => {
                              const totalVal = dashboardStats.analytics.expenseCategoryStats.reduce((sum, c) => sum + c.value, 0) || 1;
                              const pct = Math.round((item.value / totalVal) * 100);
                              return (
                                <div key={idx}>
                                  <div className="d-flex justify-content-between small text-secondary mb-1">
                                    <span>{item._id}</span>
                                    <strong>₹{item.value} ({pct}%)</strong>
                                  </div>
                                  <div className="progress" style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                                    <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${pct}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIVITY MONTHLY TIMELINE */}
                    <div className="col-12 col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold text-warning mb-3">📸 Uploaded Memories Timeline</h5>
                        <p className="text-secondary small mb-4">Monthly frequency of memories created by you.</p>
                        <div className="d-flex justify-content-between align-items-end" style={{ height: "200px" }}>
                          {(() => {
                            const months = [];
                            for (let i = 5; i >= 0; i--) {
                              const d = new Date();
                              d.setMonth(d.getMonth() - i);
                              months.push(d.toISOString().substring(0, 7));
                            }
                            const trendData = months.map(m => {
                              const c = dashboardStats.analytics.memoriesMonthlyTrend?.find(t => t._id === m)?.count || 0;
                              const [year, month] = m.split("-");
                              const mName = new Date(year, parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' });
                              return { month: mName, count: c };
                            });
                            const maxVal = Math.max(...trendData.map(d => d.count), 1);

                            return trendData.map((d, idx) => (
                              <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: "100%" }}>
                                <div className="d-flex align-items-end justify-content-center w-100 h-100 pb-2">
                                  <div className="bg-info rounded-top" style={{ height: `${(d.count / maxVal) * 100}%`, width: "24px", minHeight: d.count > 0 ? "4px" : "0px" }} title={`Memories: ${d.count}`} />
                                </div>
                                <small className="text-secondary" style={{ fontSize: "10px" }}>{d.month}</small>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* REVIEWS WRITTEN MONTHLY */}
                    <div className="col-12 col-lg-6">
                      <div className="glass-card p-4 h-100">
                        <h5 className="fw-bold text-warning mb-3">⭐ Reviews Submitted Timeline</h5>
                        <p className="text-secondary small mb-4">Monthly count of trip reviews submitted by you.</p>
                        <div className="d-flex justify-content-between align-items-end" style={{ height: "200px" }}>
                          {(() => {
                            const months = [];
                            for (let i = 5; i >= 0; i--) {
                              const d = new Date();
                              d.setMonth(d.getMonth() - i);
                              months.push(d.toISOString().substring(0, 7));
                            }
                            const trendData = months.map(m => {
                              const c = dashboardStats.analytics.reviewsWrittenTrend?.find(t => t._id === m)?.count || 0;
                              const [year, month] = m.split("-");
                              const mName = new Date(year, parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' });
                              return { month: mName, count: c };
                            });
                            const maxVal = Math.max(...trendData.map(d => d.count), 1);

                            return trendData.map((d, idx) => (
                              <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: "100%" }}>
                                <div className="d-flex align-items-end justify-content-center w-100 h-100 pb-2">
                                  <div className="bg-warning rounded-top" style={{ height: `${(d.count / maxVal) * 100}%`, width: "24px", minHeight: d.count > 0 ? "4px" : "0px" }} title={`Reviews: ${d.count}`} />
                                </div>
                                <small className="text-secondary" style={{ fontSize: "10px" }}>{d.month}</small>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STAT CARDS PANEL */}
              {dashboardStats && (
                <div className="mb-5">
                  <h2 className="fw-bold mb-4">📊 General Overview Statistics</h2>
                  <div className="row g-3">
                    <StatCard title="Trips Created" value={dashboardStats.tripsCreated} icon="✈️" />
                    <StatCard title="Trips Joined" value={dashboardStats.tripsJoined} icon="🌍" />
                    <StatCard title="Friends" value={dashboardStats.totalFriends} icon="❤️" />
                    <StatCard title="Reviews" value={dashboardStats.totalReviews} icon="⭐" />
                    <StatCard title="Trust Score" value={`${dashboardStats.trustScore}%`} icon="🏆" />
                    <StatCard title="Expenses" value={`₹${dashboardStats.totalExpenses}`} icon="💸" />
                    <StatCard title="Pending Requests" value={dashboardStats.pendingRequests} icon="📨" />
                    <StatCard title="Memories" value={dashboardStats.totalMemories} icon="📸" />
                    <StatCard title="Blogs Published" value={dashboardStats.totalBlogs || 0} icon="📝" />
                  </div>
                </div>
              )}

            </>

          )

        }


      </div>

    </div>

  );

}

export default Dashboard;