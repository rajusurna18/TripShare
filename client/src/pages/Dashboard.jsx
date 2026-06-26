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

  const fetchTrips = async () => {

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

  const fetchProfile = async () => {

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

  const fetchDashboardStats =
    async () => {

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
  const fetchFeed = async (pageNum = 1) => {
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

      <div className="container py-5">

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
                className="btn btn-custom"
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
                        className="btn btn-custom"
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


              {/* ANALYTICS */}

              {

                dashboardStats && (

                  <>

                    <div className="mb-5">

                      <h2 className="fw-bold mb-4">

                        📊 Analytics Dashboard

                      </h2>

                      <div className="row g-3">

                        <StatCard

                          title="Trips Created"

                          value={
                            dashboardStats.tripsCreated
                          }

                          icon="✈️"

                        />

                        <StatCard

                          title="Trips Joined"

                          value={
                            dashboardStats.tripsJoined
                          }

                          icon="🌍"

                        />

                        <StatCard

                          title="Friends"

                          value={
                            dashboardStats.totalFriends
                          }

                          icon="❤️"

                        />

                        <StatCard

                          title="Reviews"

                          value={
                            dashboardStats.totalReviews
                          }

                          icon="⭐"

                        />

                        <StatCard

                          title="Trust Score"

                          value={`${dashboardStats.trustScore}%`}

                          icon="🏆"

                        />

                        <StatCard

                          title="Expenses"

                          value={`₹${dashboardStats.totalExpenses}`}

                          icon="💸"

                        />

                        <StatCard
                          title="Pending Requests"
                          value={
                            dashboardStats.pendingRequests
                          }
                          icon="📨"
                        />

                        <StatCard
                          title="Memories"
                          value={
                            dashboardStats.totalMemories
                          }
                          icon="📸"
                        />

                        <StatCard
                          title="Blogs Published"
                          value={
                            dashboardStats.totalBlogs || 0
                          }
                          icon="📝"
                        />

                      </div>

                    </div>

                  </>

                )

              }

            </>

          )

        }


      </div>

    </div>

  );

}

export default Dashboard;