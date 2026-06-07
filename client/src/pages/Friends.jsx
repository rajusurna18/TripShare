import {
  useEffect,
  useState,
} from "react";

import API
from "../services/api";

import FriendCard
from "../components/shared/FriendCard";

function Friends() {

  const [friends, setFriends] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const currentUser =
    JSON.parse(

      localStorage.getItem(
        "user"
      ) || "{}"

    );

  useEffect(() => {

    fetchFriends();

    fetchRequests();

  }, []);

  // FETCH FRIENDS

  const fetchFriends =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            "/friends",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setFriends(
          res.data.friends
        );

      } catch (err) {

        console.log(err);

      }

  };

  // FETCH REQUESTS

  const fetchRequests =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            "/friends/requests",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setRequests(
          res.data.requests
        );

      } catch (err) {

        console.log(err);

      }

  };

  // ACCEPT

  const acceptRequest =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await API.put(

          `/friends/accept/${id}`,

          {},

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );

        fetchFriends();

        fetchRequests();

      } catch (err) {

        console.log(err);

      }

  };

  // REJECT

  const rejectRequest =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await API.put(

          `/friends/reject/${id}`,

          {},

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        );

        fetchRequests();

      } catch (err) {

        console.log(err);

      }

  };

  return (

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >

      <div className="container">

        <h1 className="fw-bold mb-5">

          ❤️ Friends & Requests

        </h1>

        {/* REQUESTS */}

        <div className="glass-card p-4 mb-5">

          <h2 className="mb-4">

            Pending Requests

          </h2>

          {

            requests.length === 0

              ? (

                <p>

                  No pending requests 📭

                </p>

              )

              : (

                requests.map(
                  (req) => (

                    <FriendCard

                      key={req._id}

                      user={req.sender}

                      showActions={true}

                      onAccept={() =>

                        acceptRequest(
                          req._id
                        )

                      }

                      onReject={() =>

                        rejectRequest(
                          req._id
                        )

                      }

                    />

                  )
                )

              )

          }

        </div>

        {/* FRIENDS */}

        <div className="glass-card p-4">

          <h2 className="mb-4">

            Your Friends

          </h2>

          {

            friends.length === 0

              ? (

                <p>

                  No friends yet 🤝

                </p>

              )

              : (

                friends.map(
                  (friend) => {

                    const user =

                      friend.sender
                        ?._id ===
                      currentUser._id

                        ? friend.receiver

                        : friend.sender;

                    return (

                      <FriendCard

                        key={friend._id}

                        user={user}

                      />

                    );

                  }
                )

              )

          }

        </div>

      </div>

    </div>

  );

}

export default Friends;