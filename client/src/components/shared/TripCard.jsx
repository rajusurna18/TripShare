import { Link } from "react-router-dom";

function TripCard({ trip }) {

  return (

    <div className="trip-card glass-card">

      {/* IMAGE */}

      <div className="trip-image-wrapper">

        <img
          src={trip.image}
          alt={trip.title}
          className="trip-image"
        />

        <span className="trip-badge">

          Active

        </span>

      </div>

      {/* CONTENT */}

      <div className="trip-card-content">

        <h3 className="trip-title">

          {trip.title}

        </h3>

        <div className="trip-details">

          <p>

            📍
            <span>
              {trip.destination}
            </span>

          </p>

          <p>

            💰
            <span>
              ₹{trip.budget}
            </span>

          </p>

          <p>

            📅
            <span>
              {
                new Date(trip.date)
                  .toDateString()
              }
            </span>

          </p>

        </div>

        {/* BUTTONS */}

        <div className="trip-buttons">

          <button className="btn btn-custom">

            Join Trip

          </button>

          <Link
            to={`/matches/${trip._id}`}
            className="btn btn-outline-warning"
          >

            Matches

          </Link>

        </div>

      </div>

    </div>

  );

}

export default TripCard;