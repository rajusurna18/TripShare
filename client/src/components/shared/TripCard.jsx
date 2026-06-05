import { Link } from "react-router-dom";
import API from "../../services/api";

function TripCard({ trip }) {

  const currentUser =
  JSON.parse(

    localStorage.getItem(
      "user"
    ) || "{}"

  );

const sendJoinRequest =
  async () => {

    try {

      await API.post(

        `/join-requests/${trip._id}`

      );

      alert(
        "Join request sent ✈️"
      );

    } catch (err) {

      alert(

        err?.response?.data
          ?.message ||

        "Failed to send request"

      );

    }

};

  return (

    <div className="trip-card glass-card">

      {/* IMAGE */}

      <div className="trip-image-wrapper">

       {
  trip?.image ? (

    <img
      src={trip.image}
      alt={trip.title}
      className="trip-image"
    />

  ) : (

    <div
      className="trip-image d-flex justify-content-center align-items-center text-light"
      style={{
        height: "220px",
        background: "#222",
        borderRadius: "12px",
        fontSize: "18px",
      }}
    >

      No Image Added 📷

    </div>

  )
}

        <span className="trip-badge">

          Active

        </span>

      </div>

      {/* CONTENT */}

      <div className="trip-card-content">

        <h3 className="trip-title">

          {trip?.title || "Untitled Trip"}

        </h3>

        <div className="trip-details">

          <p>

            📍
            <span>
              {trip?.destination || "Unknown"}
            </span>

          </p>

          <p>

            💰
            <span>
              ₹{trip?.budget || 0}
            </span>

          </p>

          <p>

            📅
            <span>

              {
                trip?.date
                  ? new Date(
                      trip.date
                    ).toDateString()
                  : "No Date"
              }

            </span>

          </p>

        </div>

        {/* BUTTONS */}

        <div
          className="trip-buttons"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "15px",
          }}
        >

          {/* CHAT */}

          <Link
            to={`/chat/${trip?._id}`}
            className="btn btn-custom"
          >

            💬 Chat

          </Link>

          {/* EXPENSES */}

          <Link
            to={`/expenses/${trip?._id}`}
            className="btn btn-warning"
          >

            💸 Expenses

          </Link>

          <Link
          to={`/live/${trip._id}`}
          className="btn btn-success"
           >

           Live Tracking

           </Link>

         {

           trip?.createdBy !==
          currentUser?._id && (

           <button

             className="btn btn-outline-light"

             onClick={
            sendJoinRequest
            }

          >

            ✈️ Request Join

           </button>

          )

         }

          {/* MATCHES */}

          <Link
            to="/matches"
            className="btn btn-outline-warning"
          >

            🤝 Matches

          </Link>

        </div>

      </div>

    </div>

  );

}

export default TripCard;