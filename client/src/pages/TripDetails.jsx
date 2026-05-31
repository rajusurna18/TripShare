
import { useEffect, useState }
from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import API
from "../services/api";

function TripDetails() {

  const { tripId } =
    useParams();

  const [trip, setTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchTrip();

  }, []);

  // FETCH TRIP

  const fetchTrip =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            `/trips/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setTrip(
          res.data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  // LOADING

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 d-flex justify-content-center align-items-center text-light">

        <div className="text-center">

          <div
            className="spinner-border text-warning mb-3"
          />

          <h4>

            Loading Trip...

          </h4>

        </div>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      {/* HERO */}

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

              Active Trip ✈️

            </span>

            <h1>

              {trip?.destination}

            </h1>

            <p>

              Travel smarter with
              your crew using
              TripShare AI.

            </p>

          </div>

        </div>

      </div>

      <div className="container py-5">

        {/* ACTIONS */}

        <div className="d-flex flex-wrap gap-3 mb-5">

          <Link

            to={`/chat/${trip._id}`}

            className="btn btn-custom"

            onClick={() =>

              localStorage.setItem(

                "activeTripId",

                trip._id

              )

            }

          >

            Open Group Chat 💬

          </Link>

          <Link

            to="/matches"

            className="btn btn-outline-warning"

          >

            Find Travel Matches 🌍

          </Link>

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

                    {

                      trip?.date
                        ?.slice(0, 10)

                    }

                  </p>

                </div>

                <div className="trip-info-card">

                  <h5>

                    👥 Travelers

                  </h5>

                  <p>

                    {

                      trip?.members
                        ?.length || 0

                    }

                  </p>

                </div>

              </div>

              {/* DESCRIPTION */}

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

                Trip Insights 📊

              </h2>

              <div className="trip-stat-box">

                👥 Members Joined

                <span>

                  {

                    trip?.members
                      ?.length || 0

                  }

                </span>

              </div>

              <div className="trip-stat-box">

                💰 Total Budget

                <span>

                  ₹{

                    trip?.budget || 0

                  }

                </span>

              </div>

              <div className="trip-stat-box">

                📅 Travel Date

                <span>

                  {

                    trip?.date
                      ?.slice(0, 10)

                  }

                </span>

              </div>

              <div className="trip-stat-box">

                🧑 Created By

                <span>

                  {

                    trip?.createdBy
                      ?.name ||

                    "Traveler"

                  }

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

            <Link

              to="/matches"

              className="btn btn-custom"

            >

              Find More Travelers

            </Link>

          </div>

          <div className="traveler-grid">

            {

              trip?.members?.length > 0 ? (

                trip.members.map(

                  (member) => (

                    <div
                      className="traveler-card"
                      key={member._id}
                    >

                      <img

                        src={

                          member.profileImage ||

                          "https://i.pravatar.cc/100"

                        }

                        alt={member.name}

                      />

                      <h5>

                        {member.name}

                      </h5>

                      <p>

                        {

                          member.travelStyle ||

                          "Traveler"

                        }

                      </p>

                    </div>

                  )

                )

              ) : (

                <div className="text-center w-100">

                  <h5>

                    No travelers joined yet.

                  </h5>

                </div>

              )

            }

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

                      (trip?.members?.length || 1)

                    )

                  }

                </span>

              </div>

              <div className="expense-item">

                Total Travelers

                <span>

                  {

                    trip?.members
                      ?.length || 0

                  }

                </span>

              </div>

            </div>

          </div>

          {/* CHAT */}

          <div className="col-lg-6">

            <div className="glass-card p-4 h-100">

              <h2 className="text-warning mb-4">

                Group Chat 💬

              </h2>

              <div className="chat-preview-box">

                <div className="empty-chat">

                  <h4>

                    Connect With Travelers

                  </h4>

                  <p>

                    Open the live group
                    chat and coordinate
                    your trip in real time.

                  </p>

                </div>

              </div>

              <Link

                to={`/chat/${trip._id}`}

                className="btn btn-custom mt-4 w-100"

                onClick={() =>

                  localStorage.setItem(

                    "activeTripId",

                    trip._id

                  )

                }

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

