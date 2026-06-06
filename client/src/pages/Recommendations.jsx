import {
  useEffect,
  useState,
} from "react";

import API
from "../services/api";

import RecommendationCard
from "../components/recommendation/RecommendationCard";

function Recommendations() {

  const [

    recommendations,

    setRecommendations

  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchRecommendations =
    async () => {

      try {

        const res =
          await API.get(

            "/recommendations"

          );

        setRecommendations(

          res.data
            .recommendations || []

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  useEffect(() => {

    fetchRecommendations();

  }, []);

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <h2>

          AI is finding trips... 🤖

        </h2>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HEADER */}

        <div className="mb-5 text-center">

          <h1 className="fw-bold">

            AI Trip Recommendations 🤖

          </h1>

          <p className="dashboard-subtitle">

            Trips selected specifically
            for your travel profile.

          </p>

        </div>

        {

          recommendations.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h3>

                No Recommendations Yet

              </h3>

              <p>

                Complete your profile
                and interests to improve
                AI suggestions.

              </p>

            </div>

          ) : (

            <div className="row g-4">

              {

                recommendations.map(

                  (item) => (

                    <div

                      key={
                        item.trip?._id
                      }

                      className="col-lg-4 col-md-6"

                    >

                      <RecommendationCard

                        recommendation={
                          item
                        }

                      />

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

export default Recommendations;