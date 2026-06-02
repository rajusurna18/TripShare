import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import socket
from "../socket";

// FIX MARKER ICON

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

});

function LiveTracking() {

  const { tripId } =
    useParams();

  const [users, setUsers] =
    useState([]);

  const currentUser =
    JSON.parse(

      localStorage.getItem(
        "user"
      ) || "{}"

    );

  // GET LIVE LOCATION

  useEffect(() => {

    if (
      navigator.geolocation
    ) {

      navigator.geolocation.watchPosition(

        (position) => {

          const data = {

            tripId,

            userId:
              currentUser._id,

            name:
              currentUser.name,

            lat:
              position.coords.latitude,

            lng:
              position.coords.longitude,

          };

          socket.emit(

            "live_location",

            data

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

  }, []);

  // RECEIVE USERS

  useEffect(() => {

    socket.emit(
      "join_trip",
      tripId
    );

    socket.on(

      "update_locations",

      (data) => {

        setUsers(data);

      }

    );

    return () => {

      socket.off(
        "update_locations"
      );

    };

  }, []);

  return (

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
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

          users.map(
            (user) => (

              <div

                key={user.userId}

                style={{
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

                  {user.name}

                </span>

                <span
                  style={{
                    color: "#aaa",
                  }}
                >

                  ({user.lat.toFixed(3)},
                  {" "}
                  {user.lng.toFixed(3)})

                </span>

              </div>

            )
          )

        }

      </div>

      {/* MAP */}

      <MapContainer

        center={[17.385, 78.4867]}

        zoom={12}

        style={{

          height: "500px",

          borderRadius: "20px",

        }}

      >

        <TileLayer

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />

        {

          users.map(
            (user) => (

              <Marker

                key={user.userId}

                position={[
                  user.lat,
                  user.lng,
                ]}

              >

                <Popup>

                  🟢 {user.name}

                </Popup>

              </Marker>

            )
          )

        }

      </MapContainer>

      {/* BUTTONS */}

      <div className="mt-4 d-flex gap-3">

        <Link
          to={`/chat/${tripId}`}
          className="btn btn-warning"
        >

          Open Chat

        </Link>

        <Link
          to={`/expenses/${tripId}`}
          className="btn btn-outline-warning"
        >

          Expenses

        </Link>

      </div>

    </div>

  );

}

export default LiveTracking;