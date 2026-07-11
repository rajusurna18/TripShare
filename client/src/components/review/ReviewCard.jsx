import Avatar from "../shared/Avatar";

 function ReviewCard({ review, onEdit, onDelete }) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isReviewer = review?.reviewer && (review.reviewer._id === currentUser._id || review.reviewer === currentUser._id);

  return (

    <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">

      <div>
        {/* REVIEWER */}

        <div className="d-flex align-items-center gap-3 mb-3">

          <Avatar
            src={review?.reviewer?.profileImage}
            alt="reviewer"
            size={60}
          />

          <div>

            <h5 className="mb-1">

              {review?.reviewer?.name || "Traveler"}

            </h5>

            <small className="text-secondary">

              {new Date(
                review?.createdAt
              ).toLocaleDateString()}

            </small>

          </div>

        </div>

        {/* RATING */}

        <div className="mb-3">

          <h4 className="text-warning m-0">

            ⭐ {review?.rating || 0}/5

          </h4>

        </div>

        {/* COMMENT */}

        <p
          style={{
            minHeight: "80px",
          }}
        >

          {review?.comment ||
            "No review comment provided."}

        </p>

        {

          review?.trip && (

            <div className="mt-3">

              <small className="text-secondary">

                ✈️ {review.trip.title}

              </small>

              <br />

              <small className="text-secondary">

                📍 {review.trip.destination}

              </small>

            </div>

          )

        }
      </div>

      {isReviewer && (onEdit || onDelete) && (
        <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-secondary border-opacity-10">
          <button className="btn btn-sm btn-outline-secondary text-light" onClick={() => onEdit(review)}>
            ✏️ Edit
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(review._id)}>
            🗑️ Delete
          </button>
        </div>
      )}

    </div>

  );

}

export default ReviewCard;