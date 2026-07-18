
import {
  useState,
} from "react";

import API
from "../../services/api";

function AddReviewModal({

  userId,

  tripId,

  fetchReviews,

}) {

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // SUBMIT REVIEW

  const submitReview =
    async () => {

      try {

        setLoading(true);

        await API.post(

          "/api/reviews",

          {

            reviewFor:
              userId,

            trip:
              tripId,

            rating,

            comment,

          }

        );

        alert(
          "Review Added ⭐"
        );

        setComment("");

        fetchReviews();

      } catch (err) {

        console.log(err);

        alert(

          err?.response?.data
            ?.message ||

          "Review failed"

        );

      } finally {

        setLoading(false);

      }

  };

  return (

    <div className="glass-card p-4 mb-5">

      <h3 className="mb-4">

        Add Review ⭐

      </h3>

      {/* RATING */}

      <select

        className="form-select mb-3"

        value={rating}

        onChange={(e) =>

          setRating(
            e.target.value
          )

        }

      >

        <option value="5">

          ⭐⭐⭐⭐⭐

        </option>

        <option value="4">

          ⭐⭐⭐⭐

        </option>

        <option value="3">

          ⭐⭐⭐

        </option>

        <option value="2">

          ⭐⭐

        </option>

        <option value="1">

          ⭐

        </option>

      </select>

      {/* COMMENT */}

      <textarea

        className="form-control mb-3"

        rows="4"

        placeholder="Share your experience..."

        value={comment}

        onChange={(e) =>

          setComment(
            e.target.value
          )

        }

      />

      {/* BUTTON */}

      <button

        className="btn btn-warning"

        onClick={submitReview}

        disabled={loading}

      >

        {

          loading

            ? "Submitting..."

            : "Submit Review"

        }

      </button>

    </div>

  );

}

export default AddReviewModal;