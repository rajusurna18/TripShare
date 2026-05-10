import { useEffect, useState } from "react";

import { getTrips } from "../services/trip.api";

import TripCard from "../components/shared/TripCard";

import { Link } from "react-router-dom";

function Trips() {

  const [trips, setTrips] = useState([]);

  useEffect(() => {

    const fetchTrips = async () => {

      try {

        const res = await getTrips();

        setTrips(res.data);

      } catch (err) {

        console.log(err);

      }

    };

    fetchTrips();

  }, []);

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="dashboard-header">

          <h1>
            Welcome To TripShare 🌍
          </h1>

          <p>
            Plan smarter. Travel better. Share memories.
          </p>

        </div>

        <div className="dashboard-grid">

          <Link to="/ai" className="dashboard-box">
            <h3>🤖 AI Planner</h3>
            <p>
              Ask AI for trip suggestions,
              budgets, and destinations.
            </p>
          </Link>

          <Link to="/matches" className="dashboard-box">
            <h3>🧭 Smart Matches</h3>
            <p>
              Find travelers with similar
              interests and travel goals.
            </p>
          </Link>

          <Link to="/chat" className="dashboard-box">
            <h3>💬 Travel Chat</h3>
            <p>
              Connect and discuss plans
              with your travel buddies.
            </p>
          </Link>

        </div>

        <div className="mt-5">

          <h2 className="section-title">
            Explore Trips ✈️
          </h2>

          <div className="row g-4">

            {
              trips.map((trip) => (

                <div
                  className="col-md-4"
                  key={trip._id}
                >

                  <TripCard trip={trip} />

                </div>

              ))
            }

          </div>

        </div>

      </div>

    </div>

  );
}

export default Trips;