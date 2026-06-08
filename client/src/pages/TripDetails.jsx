import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import API
from "../services/api";

import socket
from "../socket";

import {

  MapContainer,

  TileLayer,

  Marker,

  Popup,

} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function TripDetails() {

  const { tripId } =
    useParams();

  const [trip, setTrip] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [location, setLocation] =
    useState(null);

  const [membersLocations,
    setMembersLocations] =
    useState([]);

    const currentUser =
  JSON.parse(

    localStorage.getItem(
      "user"
    ) || "{}"

  );

  // FETCH TRIP

  useEffect(() => {

    fetchTrip();

  }, [tripId]);

  // SOCKET GPS

  useEffect(() => {

    if (!socket.connected) {

      socket.connect();

    }

    socket.emit(
      "join_trip",
      tripId
    );

    // RECEIVE LIVE LOCATIONS

    socket.on(

      "update_locations",

      (data) => {

        setMembersLocations(data);

      }

    );

    return () => {

      socket.off(
        "update_locations"
      );

    };

  }, [tripId]);

  // LIVE GPS

  useEffect(() => {

    if (
      navigator.geolocation
    ) {

      navigator.geolocation.watchPosition(

        (position) => {

          const coords = {

            lat:
              position.coords.latitude,

            lng:
              position.coords.longitude,

          };

          setLocation(coords);

          const currentUser =
            JSON.parse(

              localStorage.getItem(
                "user"
              ) || "{}"

            );

          socket.emit(

            "live_location",

            {

              tripId,

              userId:
                currentUser._id,

              name:
                currentUser.name,

              ...coords,

            }

          );

        },

        (err) => {

          console.log(err);

        },

        {

          enableHighAccuracy:
            true,

        }

      );

    }

  }, [tripId]);

  // FETCH TRIP

  const fetchTrip =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            `/trips/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setTrip(

          res.data.trip ||
          res.data

        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

  };

  // LOADING

  if (loading) {

    return (

      <div className="text-white p-5">

        Loading...

      </div>

    );

  }

  // TRIP NOT FOUND

  if (!trip) {

    return (

      <div className="text-white p-5">

        Trip not found

      </div>

    );

  }

  return (

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "30px",
      }}
    >

      <h1 className="mb-4">

        🌍 Trip Live Tracking

      </h1>

      {/* TEAMMATES */}

      <div
        style={{
          background: "#1e1e1e",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "20px",
        }}
      >

        <h3>

          Teammates

        </h3>

        {

          membersLocations.map(
            (member) => (

              <div

                key={member.userId}

                style={{
                  flexWrap:"wrap",
                   display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}

              >

                <span
                  style={{
                    color: "lime",
                    fontSize: "20px",
                  }}
                >

                  ●

                </span>

                <span>

                  {member.name}

                </span>

                <span
                  style={{
                    color: "#aaa",
                  }}
                >

                  ({member.lat.toFixed(3)},
                  {" "}
                  {member.lng.toFixed(3)})

                </span>

              </div>

            )
          )

        }

      </div>

      {/* MAP */}

      {

        location && (

          <MapContainer

            center={[

              location.lat,

              location.lng,

            ]}

            zoom={13}

           style={{
                height: "450px",
                width: "100%",
               borderRadius: "20px",
               }}

          >

            <TileLayer

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />

            {

              membersLocations.map(

                (member) => (

                  <Marker

                    key={
                      member.userId
                    }

                    position={[

                      member.lat,

                      member.lng,

                    ]}

                  >

                    <Popup>

                      🟢 {member.name}

                    </Popup>

                  </Marker>

                )

              )

            }

          </MapContainer>

        )

      }

      {/* ACTIONS */}

         <div className="mt-4 d-flex gap-3 flex-wrap">

         <Link
          to={`/chat/${tripId}`}
          className="btn btn-warning"
          >

           Open Chat 💬

          </Link>

           <Link
            to={`/expenses/${tripId}`}
            className="btn btn-outline-warning"
            >

            Expenses 💳

         </Link>

         <Link
          to={`/memories/${tripId}`}
          className="btn btn-outline-light"
    >   
           📸 Memories
        </Link>

       </div>

    </div>

  );

}

export default TripDetails;