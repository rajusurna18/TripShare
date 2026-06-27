import Avatar from "../components/shared/Avatar";

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

import API from "../services/api";

function Matches() {

  const [matches, setMatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

          setLoading(true);

          const res =
            await getMatches(
              tripId,
              page,
              12
            );

          const data = res.data.matches || res.data;
          setMatches(data);

          if (res.data.total) {
            setTotalPages(Math.ceil(res.data.total / 12));
          } else {
            setTotalPages(1);
          }

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);

        }

      };

    fetchMatches();

  }, [tripId, page]);

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

  const sendFriendRequest =
  async (receiverId) => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await API.post(

        "/friends/request",

        {
          receiver: receiverId,
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }

      );

      alert(
        "Friend request sent 🤝"
      );

    } catch (err) {

      console.log(err);

    }

};

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HEADER */}

        <div className="mb-5 text-center">

         <h1 className="fw-bold display-6 display-md-5">

            🤖 Smart AI Travel Matches

          </h1>

          <p className="dashboard-subtitle mt-3">

            Discover travelers with
            matching personalities,
            travel styles,
            destinations,
            and interests.

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

                AI is finding your best matches...

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
            <>
            <div className="row g-4">

              {

                matches.map(

                  (item) => (

                    <div
                     className="col-12 col-sm-6 col-lg-4"
                      key={item.user?._id}
                    >

                      <div className="glass-card p-4 h-100 text-center match-card-modern">

                        {/* PROFILE IMAGE */}

                        <Avatar
                          src={item.user?.profileImage}
                          alt="profile"
                          className="match-profile-img"
                          style={{
                            border: "4px solid #ffb703",
                          }}
                          size={100}
                        />

                        {/* NAME */}

                        <h2 className="match-name mt-3 fw-bold">

                          {

                            item.user?.name

                          }

                        </h2>

                        {/* MATCH SCORE */}

                        <div className="match-score-circle mt-3 mb-3">

                          <span
                            className="fw-bold text-warning"
                            style={{
                              fontSize: "32px",
                            }}
                          >

                            {

                              item.score

                            }%

                          </span>

                          <small className="d-block text-secondary">

                            Compatibility

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

                                  : "Explore Together"

                              }

                            </strong>

                          </p>

                        </div>

                  {/* ACTION BUTTONS */}
                  
                  <div className="d-grid gap-2 mt-4">
                       <button

                           className="btn btn-custom flex-fill"

                            onClick={() =>

                              sendFriendRequest(
                              item.user?._id
                            )

                           }

                           >

                          Connect 🤝

                     </button>

                    <button

                      className="btn btn-outline-warning flex-fill"

                      onClick={() =>

                          navigate(

                         `/profile/${item.user?._id}`

          
                        )

                       }

                    >

                      Profile 👤

                    </button>

                   <button

                className="btn btn-outline-light flex-fill"

               onClick={() =>

                 navigate(

                  `/reviews/${item.user?._id}`
           
                    )

                       }

                      >

                       Reviews ⭐

                      </button>

                       </div>

                      </div>

                    </div>

                  )

                )

              }

            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                <button
                  className="btn btn-outline-warning px-4 py-2"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  style={{ borderRadius: "10px", fontWeight: "600" }}
                >
                  ◀ Prev
                </button>
                <span className="text-secondary fw-semibold">
                  Page <strong className="text-warning">{page}</strong> of {totalPages}
                </span>
                <button
                  className="btn btn-outline-warning px-4 py-2"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  style={{ borderRadius: "10px", fontWeight: "600" }}
                >
                  Next ▶
                </button>
              </div>
            )}
            </>
          )

        }

      </div>

    </div>

  );

}

export default Matches;
