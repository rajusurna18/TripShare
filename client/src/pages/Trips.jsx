import { useEffect, useState } from "react";

import { getTrips } from "../services/trip.api";

import TripCard from "../components/shared/TripCard";

import Navbar from "../components/shared/Navbar";

function Trips() {

  const [trips, setTrips] = useState([]);

  useEffect(() => {

    const fetchTrips = async () => {

      const res = await getTrips();

      setTrips(res.data);
    };

    fetchTrips();

  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="p-10">

        <h1 className="text-4xl font-bold mb-8">
          Explore Trips 🌍
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {
            trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
              />
            ))
          }

        </div>

      </div>

    </div>
  );
}

export default Trips;