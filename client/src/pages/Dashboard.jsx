import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import API from "../services/api";

function Dashboard() {

  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);

  useEffect(() => {

    fetchTrips();
    fetchProfile();

  }, []);

  // FETCH TRIPS

  const fetchTrips = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await API.get(
        "/api/trips",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setTrips(res.data);

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
        "/api/profile",
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

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HERO */}

        <div className="dashboard-header mb-5">

          <div className="row align-items-center g-4">

            {/* LEFT */}

            <div className="col-lg-8">

              <h1 className="fw-bold display-5 text-white">

                Welcome Back,
                {" "}

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

            {/* PROFILE */}

            <div className="col-lg-4">

              <Link
                to="/profile"
                className="profile-card-modern text-decoration-none"
              >

                <img
                  src={
                    user?.profileImage ||
                    "https://i.pravatar.cc/150"
                  }
                  alt="profile"
                />

                <div>

                  <h4>

                    {user?.name || "Traveler"}

                  </h4>

                  <p>

                    {user?.email}

                  </p>

                  <small>

                    Premium Traveler 🚀

                  </small>

                </div>

              </Link>

            </div>

          </div>

        </div>

        {/* TOP SECTION */}

        <div className="row g-4 mb-5">

          {/* LEFT SECTION */}

          <div className="col-lg-8 d-flex flex-column gap-4">

            {/* VIEW DETAILS */}

            <div className="special-card glass-card p-4 view-trip-card">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>

                  <h2 className="text-warning mb-2">

                    ✈️ Explore Your Trips

                  </h2>

                  <p className="dashboard-text m-0">

                    Manage your adventures,
                    explore destinations,
                    and track travel experiences.

                  </p>

                </div>

                <Link
                  to="/trips"
                  className="btn btn-custom view-details-btn"
                >

                  View Details

                </Link>

              </div>

            </div>

            {/* AI ASSISTANT */}

<div className="special-card glass-card p-4 ai-assistant-card">

  <div className="d-flex flex-column h-100 justify-content-between">

    <div>

      <h2 className="text-warning mb-3">

        🤖 TripShare AI Assistant

      </h2>

      <p className="dashboard-text ai-text">

        Ask travel questions,
        generate itineraries,
        estimate budgets,
        discover destinations,
        and get smart travel guidance instantly.

      </p>

    </div>

    {/* BUTTON */}

    <div className="mt-4">

      <Link
        to="/itinerary"
        className="btn btn-custom ai-btn"
      >

        Open AI Planner 🚀

      </Link>

    </div>

  </div>

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

                    {
                      new Set(
                        trips.map(
                          (trip) =>
                            trip.destination
                        )
                      ).size
                    }

                  </span>

                </div>

                <div className="stats-row">

                  👥 Travelers

                  <span>

                    {trips.length * 3}

                  </span>

                </div>

                <div className="stats-row">

                  💰 Savings

                  <span>

                    ₹{trips.length * 5000}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* FEATURES */}

        <div className="row g-4 mb-5">

          {/* MATCHES */}

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

                  Find travelers who match
                  your interests, vibe,
                  budget, and travel goals.

                </p>

                <span className="feature-tag">

                  AI Compatibility System

                </span>

              </div>

            </Link>

          </div>

          {/* CHAT */}

          <div className="col-lg-6">

            <Link
              to="/chat"
              className="dashboard-box feature-box h-100 text-decoration-none"
            >

              <div className="feature-icon">

                💬

              </div>

              <div className="feature-content">

                <h2>

                  Personal Travel Chat

                </h2>

                <p>

                  Chat with travelers,
                  share plans,
                  and stay connected
                  in real time.

                </p>

                <span className="feature-tag">

                  Live Messaging Experience

                </span>

              </div>

            </Link>

          </div>

        </div>

        {/* CURRENT TRIPS */}

        <div className="current-trips-wrapper mb-5">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

            <h2 className="section-title m-0">

              Current Trips ✈️

            </h2>

          </div>

          {
            loading ? (

              <div className="empty-box">

                <h3>

                  Loading trips...

                </h3>

              </div>

            ) : (

              <div className="row g-4">

                {
                  trips.length === 0 ? (

                    <div className="empty-box">

                      <div className="empty-icon">

                        ✈️

                      </div>

                      <h3>

                        No Trips Yet

                      </h3>

                      <p>

                        Create your first adventure
                        and start exploring the world.

                      </p>

                      <Link
                        to="/create-trip"
                        className="btn btn-custom mt-3"
                      >

                        Create Trip

                      </Link>

                    </div>

                  ) : (

                    trips.map((trip, index) => (

                      <div
                        className="col-sm-12 col-md-6 col-lg-4"
                        key={index}
                      >

                        <div className="trip-card glass-card h-100">

                          {/* IMAGE */}

                          <div className="trip-image-wrapper">

                            <img
                              src={
                                trip.image ||
                                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                              }
                              alt={trip.destination}
                              className="trip-image"
                            />

                            <div className="trip-overlay">

                              <span className="trip-badge">

                                Active

                              </span>

                            </div>

                          </div>

                          {/* CONTENT */}

                          <div className="p-4">

                            <h3 className="trip-title">

                              {trip.destination}

                            </h3>

                            <div className="trip-details mt-3">

                              <p>

                                📍 {trip.destination}

                              </p>

                              <p>

                                💰 ₹{trip.budget}

                              </p>

                              <p>

                                📅 {
                                  trip.date
                                    ?.slice(0, 10)
                                }

                              </p>

                            </div>

                            {/* ACTION BUTTON */}

                            <div className="trip-actions mt-4">

                              <Link
                                to="/trips"
                                className="btn btn-custom w-100"
                              >

                                View Details

                              </Link>

                            </div>

                          </div>

                        </div>

                      </div>

                    ))
                  )
                }

              </div>

            )

          }

        </div>

        {/* LOWER SECTION */}

        <div className="row g-4">

          {/* UPCOMING */}

          <div className="col-lg-6">

            <div className="special-card glass-card p-4 h-100">

              <h3 className="text-warning mb-4">

                🌴 Upcoming Adventure

              </h3>

              {
                trips.length > 0 ? (

                  <div className="upcoming-trip">

                    <h2>

                      {trips[0].destination}

                    </h2>

                    <p>

                      📅 {
                        trips[0].date
                          ?.slice(0, 10)
                      }

                    </p>

                    <p>

                      💰 Budget:
                      ₹{trips[0].budget}

                    </p>

                    <Link
                      to="/trips"
                      className="btn btn-custom mt-3"
                    >

                      Explore Trip

                    </Link>

                  </div>

                ) : (

                  <div className="empty-box">

                    <h4>

                      No Upcoming Trips

                    </h4>

                  </div>

                )
              }

            </div>

          </div>

          {/* ACTIVITY */}

          <div className="col-lg-6">

            <div className="special-card glass-card p-4 h-100">

              <h3 className="text-warning mb-4">

                🔔 Recent Activity

              </h3>

              {
                trips.length === 0 ? (

                  <div className="empty-box">

                    <h4>

                      No Recent Activity

                    </h4>

                  </div>

                ) : (

                  trips.slice(0, 4).map(
                    (trip, index) => (

                      <div
                        className="activity-item"
                        key={index}
                      >

                        ✈️ New update in
                        {" "}
                        {trip.destination}

                      </div>

                    )
                  )

                )
              }

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;