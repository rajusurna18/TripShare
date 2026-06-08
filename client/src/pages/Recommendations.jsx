import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import RecommendationCard from "../components/recommendation/RecommendationCard";

function Recommendations() {

  const [
    recommendations,
    setRecommendations,
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
          res.data.recommendations || []
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

        <div className="text-center">

          <div className="spinner-border text-warning mb-3" />

          <h3>
            AI is finding your perfect trips...
          </h3>

          <p className="text-secondary">
            Matching destinations, interests and travel style.
          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HERO */}

        <div className="glass-card p-4 p-md-5 mb-5">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            <div>

              <h1 className="fw-bold mb-2">

                🤖 AI Trip Recommendations

              </h1>

              <p className="dashboard-subtitle mb-0">

                Personalized travel suggestions based on your
                interests, personality and travel history.

              </p>

            </div>

            <span className="badge bg-warning text-dark fs-6">

              {recommendations.length} Recommendations

            </span>

          </div>

        </div>

        {/* EMPTY STATE */}

        {

          recommendations.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h2 className="text-warning mb-3">

                No Recommendations Yet

              </h2>

              <p className="text-secondary">

                Complete your profile, interests,
                travel style and personality to unlock
                smarter AI suggestions.

              </p>

            </div>

          ) : (

            <div className="row g-4">

              {

                recommendations.map(
                  (item) => (

                    <div
                      key={item.trip?._id}
                      className="col-12 col-md-6 col-xl-4"
                    >

                      <RecommendationCard
                        recommendation={item}
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