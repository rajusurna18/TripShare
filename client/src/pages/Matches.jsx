import { useEffect, useState } from "react";
import { getMatches } from "../services/match.api";

function Matches() {

  const [matches, setMatches] =
    useState([]);

  const tripId =
    "69fc8561761a0df82dc9e096";

  useEffect(() => {

    const fetchMatches =
      async () => {

        try {

          const res =
            await getMatches(
              tripId
            );

          setMatches(
            res.data
          );

        } catch (err) {

          console.log(err);

        }

      };

    fetchMatches();

  }, []);

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <h1 className="section-title mb-5">

          Smart Travel Matches 🌍

        </h1>

        <div className="row g-4">

          {
            matches.map(
              (item, index) => (

                <div
                  className="col-md-4"
                  key={index}
                >

                  <div className="glass-card p-4 h-100 text-center">

                    <img
                      src={
                        item.user
                          ?.profileImage ||

                        "https://i.pravatar.cc/150"
                      }

                      alt="profile"

                      className="match-profile-img"
                    />

                    <h2 className="match-name mt-4">

                      {
                        item.user?.name
                      }

                    </h2>

                    <p className="match-info">

                      🧠 Personality:
                      {" "}

                      {
                        item.user
                          ?.personality ||
                        "Not Added"
                      }

                    </p>

                    <p className="match-info">

                      ✈️ Style:
                      {" "}

                      {
                        item.user
                          ?.travelStyle ||
                        "Not Added"
                      }

                    </p>

                    <p className="match-info">

                      ❤️ Interests:
                      {" "}

                      {
                        item
                          .commonInterests
                          ?.length > 0

                          ? item
                              .commonInterests
                              .join(", ")

                          : "No Common Interests"
                      }

                    </p>

                    <div className="match-score-box mt-4">

                      🔥 Match Score
                      <span>

                        {item.score}%

                      </span>

                    </div>

                  </div>

                </div>

              )
            )
          }

        </div>

      </div>

    </div>

  );
}

export default Matches;