
import {

  useEffect,

  useState,

} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMatches,
} from "../services/match.api";

function Matches() {

  const [matches, setMatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  // ACTIVE TRIP

  const tripId =

    localStorage.getItem(
      "activeTripId"
    );

  // FETCH MATCHES

  useEffect(() => {

    const fetchMatches =
      async () => {

        try {

          if (!tripId) {

            setLoading(false);

            return;

          }

          const res =
            await getMatches(
              tripId
            );

          setMatches(

            res.data.matches ||

            res.data

          );

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);

        }

      };

    fetchMatches();

  }, [tripId]);

  // MATCH QUALITY

  const getMatchLevel =
    (score) => {

      if (score >= 85)
        return "Perfect Match 🔥";

      if (score >= 70)
        return "Great Match ✨";

      if (score >= 50)
        return "Good Match 👍";

      return "Basic Match";

  };

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HEADER */}

        <div className="mb-5">

          <h1 className="fw-bold display-6">

            Smart Travel Matches 🌍

          </h1>

          <p className="dashboard-subtitle">

            Discover travelers
            compatible with your
            interests,
            personality,
            and travel style.

          </p>

        </div>

        {/* LOADING */}

        {

          loading ? (

            <div className="glass-card p-5 text-center">

              <div
                className="spinner-border text-warning mb-3"
              />

              <h4>

                Finding Smart Matches...

              </h4>

            </div>

          ) : !tripId ? (

            // NO ACTIVE TRIP

            <div className="glass-card p-5 text-center">

              <h2 className="text-warning mb-3">

                No Active Trip Found ✈️

              </h2>

              <p className="dashboard-text mb-4">

                Create or join a trip
                to discover compatible
                travelers.

              </p>

              <button

                className="btn btn-custom"

                onClick={() =>

                  navigate(
                    "/create-trip"
                  )

                }

              >

                Create Trip

              </button>

            </div>

          ) : matches.length === 0 ? (

            // EMPTY STATE

            <div className="glass-card p-5 text-center">

              <h2 className="text-warning mb-3">

                No Smart Matches Yet 🧠

              </h2>

              <p className="dashboard-text mb-4">

                Complete your profile
                and join more trips
                to improve AI matching.

              </p>

              <button

                className="btn btn-custom"

                onClick={() =>

                  navigate(
                    "/profile"
                  )

                }

              >

                Update Profile

              </button>

            </div>

          ) : (

            // MATCHES GRID

            <div className="row g-4">

              {

                matches.map(

                  (item) => (

                    <div
                      className="col-lg-4 col-md-6"
                      key={item.user?._id}
                    >

                      <div className="glass-card p-4 h-100 text-center match-card-modern">

                        {/* PROFILE */}

                        <img

                          src={

                            item.user
                              ?.profileImage ||

                            "https://i.pravatar.cc/150"

                          }

                          alt="profile"

                          className="match-profile-img"

                        />

                        {/* NAME */}

                        <h2 className="match-name mt-4">

                          {

                            item.user?.name

                          }

                        </h2>

                        {/* MATCH SCORE */}

                        <div className="match-score-circle mt-3 mb-3">

                          <span>

                            {

                              item.score

                            }%

                          </span>

                          <small>

                            Match

                          </small>

                        </div>

                        {/* MATCH LEVEL */}

                        <p className="text-warning fw-bold mb-4">

                          {

                            getMatchLevel(
                              item.score
                            )

                          }

                        </p>

                        {/* DETAILS */}

                        <div className="match-details text-start">

                          <p className="match-info">

                            🧠 Personality:
                            {" "}

                            <strong>

                              {

                                item.user
                                  ?.personality ||

                                "Not Added"

                              }

                            </strong>

                          </p>

                          <p className="match-info">

                            ✈️ Travel Style:
                            {" "}

                            <strong>

                              {

                                item.user
                                  ?.travelStyle ||

                                "Not Added"

                              }

                            </strong>

                          </p>

                          <p className="match-info">

                            ❤️ Common Interests:
                            {" "}

                            <strong>

                              {

                                item
                                  .commonInterests
                                  ?.length > 0

                                  ? item
                                      .commonInterests
                                      .join(", ")

                                  : "Explore together"

                              }

                            </strong>

                          </p>

                        </div>

                        {/* ACTION BUTTONS */}

                        <div className="d-flex gap-2 mt-4">

                          <button
                            className="btn btn-custom flex-fill"
                          >

                            Connect 🤝

                          </button>

                          <button
                            className="btn btn-outline-warning flex-fill"
                          >

                            Profile 👤

                          </button>

                        </div>

                      </div>

                    </div>

                  )

                )

              }

            </div>

          )

        }

      </div>

    </div>

  );

}

export default Matches;
