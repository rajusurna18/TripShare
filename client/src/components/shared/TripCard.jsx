function TripCard({ trip }) {

  return (

    <div className="trip-card">

      <div className="trip-card-top">

        <h3>
          {trip.title}
        </h3>

        <span className="trip-badge">
          Active
        </span>

      </div>

      <div className="trip-details">

        <p>
          📍 Destination:
          <span>
            {trip.destination}
          </span>
        </p>

        <p>
          💰 Budget:
          <span>
            ₹{trip.budget}
          </span>
        </p>

        <p>
          📅 Date:
          <span>
            {new Date(trip.date).toDateString()}
          </span>
        </p>

      </div>

      <div className="trip-buttons">

        <button className="btn btn-custom">
          Join Trip
        </button>

      </div>

    </div>

  );
}

export default TripCard;