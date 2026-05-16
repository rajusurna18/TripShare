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

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">

            <div>

              <h1 className="fw-bold display-5 text-white">

                Welcome Back,
                {" "}

                <span className="text-warning">

                  {user?.name || "Traveler"}

                </span>

                {" "}
                🌍

              </h1>

              <p className="dashboard-subtitle">

                Plan smarter trips,
                connect with travelers,
                and explore the world with AI.

              </p>

            </div>

            {/* PROFILE */}

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

        {/* ACTION BUTTON */}

        <div className="d-flex gap-3 flex-wrap mb-5">

          <Link
            to="/create-trip"
            className="btn btn-custom"
          >

            + Create Trip

          </Link>

        </div>

        {/* TOP CARDS */}

        <div className="row g-4 mb-5">

          {/* AI */}

          <div className="col-lg-8">

            <div className="special-card glass-card h-100 p-4">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">

                <div>

                  <h2 className="text-warning mb-3">

                    ✨ AI Travel Planner

                  </h2>

                  <p className="dashboard-text">

                    Generate itineraries,
                    discover hidden destinations,
                    estimate budgets,
                    and build smarter adventures.

                  </p>

                </div>

                <Link
                  to="/itinerary"
                  className="premium-ai-btn"
                >

                  Open AI Planner 🚀

                </Link>

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

        {/* QUICK ACTIONS */}

        <div className="dashboard-grid mb-5">

          <Link
            to="/trips"
            className="dashboard-box"
          >

            <h3>✈️ Trips</h3>

            <p>
              Explore and manage
              your adventures.
            </p>

          </Link>

          <Link
            to="/create-trip"
            className="dashboard-box"
          >

            <h3>🧳 Create Trip</h3>

            <p>
              Organize journeys
              and invite travelers.
            </p>

          </Link>

          <Link
            to="/matches"
            className="dashboard-box"
          >

            <h3>👥 Smart Matches</h3>

            <p>
              Find compatible
              travel partners.
            </p>

          </Link>

          <Link
            to="/chat"
            className="dashboard-box"
          >

            <h3>💬 Chat</h3>

            <p>
              Real-time communication
              with your groups.
            </p>

          </Link>

          <Link
            to="/itinerary"
            className="dashboard-box"
          >

            <h3>
              ✨ AI Itinerary
            </h3>

            <p>
              Generate smart AI-powered
              travel plans instantly.
            </p>

          </Link>

        </div>

        {/* CURRENT TRIPS */}

        <div className="current-trips-wrapper mb-5">

          <h2 className="section-title mb-4">

            Current Trips ✈️

          </h2>

          {
            loading ? (

              <h3 className="text-light">

                Loading trips...

              </h3>

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

                    </div>

                  ) : (

                    trips.map((trip, index) => (

                      <div
                        className="col-md-4"
                        key={index}
                      >

                        <div className="trip-card glass-card">

                          {
                            trip.image && (

                              <img
                                src={trip.image}
                                alt={trip.destination}
                                className="trip-image"
                              />

                            )
                          }

                          <div className="p-4">

                            <div className="trip-card-top">

                              <h3>
                                {trip.destination}
                              </h3>

                              <span className="trip-badge">

                                Active

                              </span>

                            </div>

                            <div className="trip-details">

                              <p>
                                📍 {trip.destination}
                              </p>

                              <p>
                                💰 ₹{trip.budget}
                              </p>

                              <p>
                                📅 {
                                  trip.startDate
                                    ?.slice(0, 10)
                                }
                              </p>

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

          {/* EXPENSE */}

          <div className="col-lg-6">

            <div className="special-card glass-card p-4 h-100">

              <h3 className="text-warning mb-4">

                💸 Expense Summary

              </h3>

              <div className="expense-row">

                Total Trips Budget

                <span>

                  ₹
                  {
                    trips.reduce(
                      (acc, trip) =>
                        acc +
                        Number(
                          trip.budget || 0
                        ),
                      0
                    )
                  }

                </span>

              </div>

              <div className="expense-row">

                Average Budget

                <span>

                  ₹
                  {
                    trips.length > 0
                      ? Math.floor(
                          trips.reduce(
                            (acc, trip) =>
                              acc +
                              Number(
                                trip.budget || 0
                              ),
                            0
                          ) / trips.length
                        )
                      : 0
                  }

                </span>

              </div>

              <div className="expense-row">

                Estimated Savings

                <span>

                  ₹{trips.length * 5000}

                </span>

              </div>

            </div>

          </div>

          {/* ACTIVITY */}

          <div className="col-lg-6">

            <div className="special-card glass-card p-4 h-100">

              <h3 className="text-warning mb-4">

                🔔 Recent Activity

              </h3>

              {
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
              }

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;

