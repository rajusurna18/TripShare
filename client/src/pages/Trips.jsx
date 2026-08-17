import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTrips } from "../services/trip.api";

import TripCard from "../components/shared/TripCard";
import { useDebounce } from "../hooks/useDebounce";

function Trips() {
  const navigate = useNavigate();

  const [trips, setTrips] =
    useState([]);

  const [filteredTrips, setFilteredTrips] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const debouncedSearch = useDebounce(search, 300);

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
        debouncedSearch.toLowerCase()
      ) ||

    trip.title
      ?.toLowerCase()
      .includes(
        debouncedSearch.toLowerCase()
      )

  );

    setFilteredTrips(filtered);

  }, [debouncedSearch, trips]);

  // FETCH TRIPS

  async function fetchTrips() {

    try {

      const res =
        await getTrips(true);

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
      <div className="container container-responsive py-5">
        <div style={{ marginBottom: "20px" }}>
          <button className="btn btn-outline-light btn-sm btn-responsive" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

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

            <small className="text-secondary">

             {filteredTrips.length} Trips Found

           </small>

          </div>

        </div>

        {/* SEARCH */}

            <div
             className="mb-5"
             style={{
             maxWidth: "600px",
             }}
            >

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
                      className="col-12 col-md-6 col-lg-4"
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