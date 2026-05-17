import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import API from "../services/api";

function TripDetails() {

  const { tripId } = useParams();

  const [trip, setTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchTrip();

  }, []);

  const fetchTrip = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await API.get(

        `/api/trips/${tripId}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }

      );

      setTrip(res.data);

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div className="dashboard-page text-light p-5">

        Loading Trip...

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      {/* HERO BANNER */}

      <div className="trip-hero">

        <img
          src={
            trip?.image ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          }
          alt={trip?.destination}
          className="trip-hero-image"
        />

        <div className="trip-hero-overlay">

          <div className="container">

            <span className="trip-status">

              Active Adventure ✈️

            </span>

            <h1>

              {trip?.destination}

            </h1>

            <p>

              Explore smarter with TripShare AI

            </p>

          </div>

        </div>

      </div>

      <div className="container py-5">

        {/* TOP ACTIONS */}

        <div className="d-flex flex-wrap gap-3 mb-5">

          <Link
            to="/chat"
            className="btn btn-custom"
          >

            Open Group Chat 💬

          </Link>

          <button
            className="btn btn-outline-warning"
          >

            Invite Travelers 👥

          </button>

        </div>

        {/* INFO GRID */}

        <div className="row g-4 mb-5">

          {/* LEFT */}

          <div className="col-lg-8">

            <div className="glass-card p-4 h-100">

              <h2 className="text-warning mb-4">

                Trip Information

              </h2>

              <div className="trip-info-grid">

                <div className="trip-info-card">

                  <h5>

                    📍 Destination

                  </h5>

                  <p>

                    {trip?.destination}

                  </p>

                </div>

                <div className="trip-info-card">

                  <h5>

                    💰 Budget

                  </h5>

                  <p>

                    ₹{trip?.budget}

                  </p>

                </div>

                <div className="trip-info-card">

                  <h5>

                    📅 Travel Date

                  </h5>

                  <p>

                    {trip?.date?.slice(0, 10)}

                  </p>

                </div>

                <div className="trip-info-card">

                  <h5>

                    👥 Travelers

                  </h5>

                  <p>

                    {trip?.travelers || 0}

                  </p>

                </div>

              </div>

              <div className="trip-description mt-5">

                <h3 className="text-warning mb-3">

                  About This Trip

                </h3>

                <p>

                  {
                    trip?.description ||
                    "No description added yet."
                  }

                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="col-lg-4">

            <div className="glass-card p-4 h-100">

              <h2 className="text-warning mb-4">

                Quick Stats

              </h2>

              <div className="trip-stat-box">

                ✈️ Adventure Level

                <span>

                  High

                </span>

              </div>

              <div className="trip-stat-box">

                🌍 Travel Type

                <span>

                  Explorer

                </span>

              </div>

              <div className="trip-stat-box">

                🔥 Popularity

                <span>

                  Trending

                </span>

              </div>

              <div className="trip-stat-box">

                💬 Chat Activity

                <span>

                  Active

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* MEMBERS */}

        <div className="glass-card p-4 mb-5">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

            <h2 className="text-warning m-0">

              Travelers Joined 👥

            </h2>

            <button className="btn btn-custom">

              Invite More

            </button>

          </div>

          <div className="traveler-grid">

            <div className="traveler-card">

              <img
                src="https://i.pravatar.cc/100?img=1"
                alt=""
              />

              <h5>

                Alex

              </h5>

              <p>

                Adventure Lover

              </p>

            </div>

            <div className="traveler-card">

              <img
                src="https://i.pravatar.cc/100?img=5"
                alt=""
              />

              <h5>

                Sophia

              </h5>

              <p>

                Budget Traveler

              </p>

            </div>

            <div className="traveler-card">

              <img
                src="https://i.pravatar.cc/100?img=8"
                alt=""
              />

              <h5>

                Ethan

              </h5>

              <p>

                Nature Explorer

              </p>

            </div>

          </div>

        </div>

        {/* EXPENSE + CHAT */}

        <div className="row g-4">

          {/* EXPENSE */}

          <div className="col-lg-6">

            <div className="glass-card p-4 h-100">

              <h2 className="text-warning mb-4">

                Expense Overview 💸

              </h2>

              <div className="expense-item">

                Total Budget

                <span>

                  ₹{trip?.budget}

                </span>

              </div>

              <div className="expense-item">

                Per Traveler

                <span>

                  ₹{
                    Math.floor(
                      trip?.budget /
                      (trip?.travelers || 1)
                    )
                  }

                </span>

              </div>

              <div className="expense-item">

                Estimated Savings

                <span>

                  ₹5000

                </span>

              </div>

            </div>

          </div>

          {/* CHAT */}

          <div className="col-lg-6">

            <div className="glass-card p-4 h-100">

              <h2 className="text-warning mb-4">

                Group Chat Preview 💬

              </h2>

              <div className="chat-preview-box">

                <div className="chat-preview-msg">

                  “Who's ready for the trip?” 🔥

                </div>

                <div className="chat-preview-msg">

                  “Let's finalize hotels tonight.”

                </div>

                <div className="chat-preview-msg">

                  “Budget split updated.”

                </div>

              </div>

              <Link
                to="/chat"
                className="btn btn-custom mt-4 w-100"
              >

                Open Full Chat

              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default TripDetails;