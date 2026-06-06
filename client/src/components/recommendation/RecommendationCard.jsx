import {
  Link,
} from "react-router-dom";

function RecommendationCard({

  recommendation,

}) {

  const trip =
    recommendation.trip;

  const score =
    recommendation.score;

  const getLevel =
    () => {

      if (score >= 80)
        return "Perfect Match 🔥";

      if (score >= 60)
        return "Great Match ✨";

      if (score >= 40)
        return "Good Match 👍";

      return "Explore 🌍";

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

            }}

          >

            No Image 📷

          </div>

        )

      }

      {/* TITLE */}

      <h3>

        {trip?.title}

      </h3>

      {/* DESTINATION */}

      <p className="text-secondary">

        📍 {trip?.destination}

      </p>

      {/* BUDGET */}

      <p>

        💰 ₹{trip?.budget}

      </p>

      {/* SCORE */}

      <div className="mb-3">

        <h2 className="text-warning">

          {score}%

        </h2>

        <small>

          {getLevel()}

        </small>

      </div>

      {/* AI */}

      <div className="mb-4">

        <small className="text-secondary">

          AI Recommendation based on
          your interests,
          travel style,
          and destination preferences.

        </small>

      </div>

      {/* BUTTON */}

      <Link

        to={`/trip/${trip?._id}`}

        className="btn btn-custom w-100"

      >

        View Trip ✈️

      </Link>

    </div>

  );

}

export default RecommendationCard;