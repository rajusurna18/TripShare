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
        "/profile",
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

                    {

                      user?.travelStyle ||

                      "Explorer"

                    } ✈️

                  </small>

                </div>

              </Link>

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

                    {/* GROUP CHAT */}

                    <Link

                      to={
                        trips.length > 0
                          ? `/chat/${trips[0]._id}`
                          : "/trips"
                      }

                      className="quick-action-btn"

                    >

                      💬 Group Chat

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

            </>

          )

        }

      </div>

    </div>

  );

}

export default Dashboard;