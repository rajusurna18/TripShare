import Avatar from "../shared/Avatar";

 function ReviewCard({ review }) {

  return (

    <div className="glass-card p-4 h-100">

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

      {/* TRIP */}

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

  );

}

export default ReviewCard;