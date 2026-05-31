import { useEffect, useState } from "react";

import { getTrips } from "../services/trip.api";

import TripCard from "../components/shared/TripCard";

function Trips() {

  const [trips, setTrips] =
    useState([]);

  const [filteredTrips, setFilteredTrips] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchTrips();

  }, []);

  useEffect(() => {

    const filtered =
      trips.filter((trip) =>

        trip.destination
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

      );

    setFilteredTrips(filtered);

  }, [search, trips]);

  // FETCH TRIPS

  const fetchTrips = async () => {

    try {

      const res =
        await getTrips();

      setTrips(
        res.data.trips || []
      );

      setFilteredTrips(
        res.data.trips || []
      );

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);

    }

  };

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">

          <div>

            <h1 className="section-title">

              Explore Trips ✈️

            </h1>

            <p className="dashboard-subtitle">

              Discover adventures from
              travelers around the world.

            </p>

          </div>

        </div>

        {/* SEARCH */}

        <div className="mb-5">

          <input
            type="text"
            placeholder="Search destination..."
            className="form-control trip-search-input"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* LOADING */}

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

                filteredTrips.length === 0 ? (

                  <div className="empty-box">

                    <div className="empty-icon">

                      🌍

                    </div>

                    <h3>

                      No Trips Found

                    </h3>

                    <p>

                      Try searching another
                      destination.

                    </p>

                  </div>

                ) : (

                  filteredTrips.map((trip) => (

                    <div
                      className="col-sm-12 col-md-6 col-lg-4"
                      key={trip._id}
                    >

                      <TripCard trip={trip} />

                    </div>

                  ))

                )

              }

            </div>

          )

        }

      </div>

    </div>

  );

}

export default Trips;