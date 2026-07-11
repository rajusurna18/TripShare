
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

  // Edit Review States
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

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

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || "");
  };

  const submitEditReview = async () => {
    if (!editComment.trim()) {
      alert("Please enter a review comment.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.put(`/reviews/${editingReview._id}`, {
        rating: editRating,
        comment: editComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete review");
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
                  onEdit={handleEditClick}
                  onDelete={handleDeleteReview}

                />

              )
            )

          )

        }

      </div>

      {editingReview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100,
          padding: "20px"
        }}>
          <div className="glass-card p-4" style={{ width: "100%", maxWidth: "500px", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0 text-warning">Edit Review ⭐</h3>
              <button className="btn-close btn-close-white" onClick={() => setEditingReview(null)}></button>
            </div>
            
            <label className="form-label text-light">Rating</label>
            <select
              className="form-select mb-3 bg-dark text-light border-secondary"
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
            >
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5)</option>
              <option value="3">⭐⭐⭐ (3/5)</option>
              <option value="2">⭐⭐ (2/5)</option>
              <option value="1">⭐ (1/5)</option>
            </select>
            
            <label className="form-label text-light">Comment</label>
            <textarea
              className="form-control mb-4 bg-dark text-light border-secondary"
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
            
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setEditingReview(null)}>Cancel</button>
              <button className="btn btn-warning text-dark fw-bold" onClick={submitEditReview}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>

  );

}

export default Reviews;
