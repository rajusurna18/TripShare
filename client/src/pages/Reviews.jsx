
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import API
from "../services/api";

import ReviewCard
from "../components/review/ReviewCard";

import AddReviewModal
from "../components/review/AddReviewModal";

function Reviews() {

  const { userId } =
    useParams();

  const [reviews, setReviews] =
    useState([]);

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const tripId =
    localStorage.getItem(
      "activeTripId"
    );

  // FETCH REVIEWS

  const fetchReviews =
    async () => {

      try {

        const res =
          await API.get(

            `/api/reviews/${userId}`

          );

        setReviews(
          res.data.reviews
        );

        setStats(res.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  useEffect(() => {

    fetchReviews();

  }, [userId]);

  // LOADING

  if (loading) {

    return (

      <div className="dashboard-page min-vh-100 text-light d-flex justify-content-center align-items-center">

        <h2>

          Loading Reviews...

        </h2>

      </div>

    );

  }

  return (

    <div className="dashboard-page min-vh-100 text-light">


    <div className="container py-4 py-md-5">

        {/* HEADER */}

        <div className="glass-card p-4 p-md-5 mb-5 text-center">

          <h1 className="fw-bold mb-4 display-6">

            Traveler Reviews ⭐

          </h1>

          <div className="row g-4">
           
           <div className="col-12 col-md-4">

              <h2 className="text-warning">

                {

                  stats?.averageRating ||

                  0

                }

              </h2>

              <p>

                Average Rating

              </p>

            </div>

            <div className="col-md-4">

              <h2 className="text-warning">

                {

                  stats?.totalReviews ||

                  0

                }

              </h2>

              <p>

                Reviews

              </p>

            </div>

            <div className="col-md-4">

              <h2 className="text-warning">

                {

                  stats?.trustScore ||

                  0

                }%

              </h2>

              <p>

                Trust Score

              </p>

            </div>

          </div>

        </div>

        {/* ADD REVIEW */}

        <AddReviewModal

          userId={userId}

          tripId={tripId}

          fetchReviews={fetchReviews}

        />

        {/* REVIEWS */}

        {

          reviews.length === 0 ? (

            <div className="glass-card p-5 text-center">

              <h3>

                No Reviews Yet

              </h3>

            </div>

          ) : (

            reviews.map(
              (review) => (

                <ReviewCard

                  key={review._id}

                  review={review}

                />

              )
            )

          )

        }

      </div>

    </div>

  );

}

export default Reviews;
