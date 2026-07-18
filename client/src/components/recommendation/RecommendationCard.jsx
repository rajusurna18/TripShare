import { Link } from "react-router-dom";

function RecommendationCard({
  recommendation,
}) {

  const trip =
    recommendation?.trip;

  const score =
    recommendation?.score || 0;

  const getLevel = () => {

    if (score >= 80)
      return "Perfect Match 🔥";

    if (score >= 60)
      return "Great Match ✨";

    if (score >= 40)
      return "Good Match 👍";

    return "Explore 🌍";

  };

  const getBadgeColor = () => {

    if (score >= 80)
      return "success";

    if (score >= 60)
      return "warning";

    return "secondary";

  };

  return (

    <div className="glass-card p-4 h-100">

      {/* IMAGE */}

      {

        trip?.image ? (

          <img

            src={trip.image}

            alt={trip.title}

            className="img-fluid rounded mb-3"

            style={{
              height: "220px",
              width: "100%",
              objectFit: "cover",
            }}

          />

        ) : (

          <div

            className="d-flex justify-content-center align-items-center rounded mb-3"

            style={{
              height: "220px",
              background: "#222",
              fontSize: "18px",
            }}

          >

            No Image Added 📷

          </div>

        )

      }

      {/* MATCH BADGE */}

      <div className="d-flex justify-content-between align-items-center mb-3">

        <span
          className={`badge bg-${getBadgeColor()}`}
        >
          {getLevel()}
        </span>

        <span
          className="badge bg-dark border"
        >
          AI Match
        </span>

      </div>

      {/* TITLE */}

      <h3 className="fw-bold">

        {trip?.title || "Untitled Trip"}

      </h3>

      {/* DETAILS */}

      <div className="mt-3">

        <p className="mb-2">

          📍 {trip?.destination || "Unknown"}

        </p>

        <p className="mb-2">

          💰 ₹{trip?.budget || 0}

        </p>

        <p className="mb-2">

          👥 {trip?.members?.length || 0} Travelers

        </p>

        <p className="mb-2">

          📅 {

            trip?.date
              ? new Date(
                  trip.date
                ).toDateString()
              : "Flexible"
          }

        </p>

      </div>

      {/* SCORE */}

      <div
        className="text-center my-4"
      >

        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            border:
              "4px solid #ffc107",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "auto",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >

          {score}%

        </div>

        <small className="text-secondary d-block mt-2">

          Compatibility Score

        </small>

      </div>

      {/* AI REASON */}

      <div className="mb-4">

        <small className="text-secondary">

          Recommended because your interests,
          travel style and destination preferences
          closely match this trip.

        </small>

      </div>

      {/* ACTIONS */}

      <div className="d-flex gap-2">

        <Link

          to={`/trip/${trip?._id}`}

          className="btn btn-custom flex-fill"

        >

          View Trip ✈️

        </Link>

        <Link

          to={`/chat/${trip?._id}`}

          className="btn btn-outline-warning"

        >

          💬

        </Link>

      </div>

    </div>

  );

}

export default RecommendationCard;