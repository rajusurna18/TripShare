import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import SaveButton from "./SaveButton";
import ShareButton from "./ShareButton";

function TripCard({ trip }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (window.savedTripIds) {
        setIsSaved(window.savedTripIds.has(trip._id));
      } else {
        try {
          const res = await API.get("/saves");
          const ids = new Set((res.data.saves || []).map((s) => s.trip?._id).filter(Boolean));
          window.savedTripIds = ids;
          setIsSaved(ids.has(trip._id));
        } catch (err) {
          console.error("Error checking saved status in TripCard:", err);
        }
      }
    };
    checkSavedStatus();
  }, [trip._id]);

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
           className="trip-buttons trip-buttons-mobile"
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
             onClick={() =>
             localStorage.setItem(
            "activeTripId",
            trip._id
         )
         }
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
         onClick={() =>
          localStorage.setItem(
         "activeTripId",
         trip._id
         )
        }
       >
        🤝 Matches
      </Link>

      <div className="d-flex gap-2 w-100 mt-2 border-top border-secondary border-opacity-10 pt-2 justify-content-end">
        <SaveButton
          tripId={trip._id}
          initialSaved={isSaved}
          initialCount={trip.savesCount}
          onToggle={(savedState, newCount) => {
            setIsSaved(savedState);
            if (window.savedTripIds) {
              if (savedState) {
                window.savedTripIds.add(trip._id);
              } else {
                window.savedTripIds.delete(trip._id);
              }
            }
          }}
        />
        <ShareButton
          tripId={trip._id}
          tripTitle={trip.title}
          tripDestination={trip.destination}
          initialCount={trip.sharesCount}
        />
      </div>

        </div>

      </div>

    </div>

  );

}

export default TripCard;