import {

  useEffect,

  useState,

} from "react";

import API
from "../services/api";

import socket
from "../socket";

function Chat() {

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [trip, setTrip] =
    useState(null);

  // ACTIVE TRIP ID

  const tripId =

    localStorage.getItem(
      "activeTripId"
    ) || "global-room";

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

            `/api/trips/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setTrip(res.data);

      } catch (err) {

        console.log(err);

      }

  };

  // SOCKET + INITIAL DATA

  useEffect(() => {

    fetchTrip();

    // CONNECT SOCKET

    socket.connect();

    // JOIN ROOM

    socket.emit(
      "join_trip",
      tripId
    );

    // RECEIVE MESSAGE

    socket.on(

      "receive_message",

      (data) => {

        setMessages(
          (prev) => [

            ...prev,

            data,

          ]
        );

      }

    );

    return () => {

      socket.off(
        "receive_message"
      );

      socket.disconnect();

    };

  }, []);

  // SEND MESSAGE

  const sendMessage =
    () => {

      if (!message.trim())
        return;

      // SOCKET EMIT

      socket.emit(

        "send_message",

        {

          tripId,

          sender: {

            name: "You",

          },

          message,

        }

      );

      setMessage("");

  };

  return (

    <div className="chat-page">

      <div className="container py-5">

        <div className="chat-layout">

          {/* SIDEBAR */}

          <div className="chat-sidebar">

            <h2>

              🌍 TripShare

            </h2>

            <p>

              Active Group

            </p>

            <div className="group-card active-group">

              ✈ {

                trip?.title ||

                "Travel Group"

              }

            </div>

          </div>

          {/* MAIN CHAT */}

          <div className="chat-main">

            {/* TOP BAR */}

            <div className="chat-topbar">

              <div>

                <h3>

                  {

                    trip?.title ||

                    "Travel Group Chat"

                  }

                </h3>

                <span>

                  Travelers chatting live

                </span>

              </div>

            </div>

            {/* MESSAGES */}

            <div className="chat-messages">

              {

                messages.length === 0 ? (

                  <div className="empty-chat">

                    <h2>

                      👋 Welcome to Trip Chat

                    </h2>

                    <p>

                      Start chatting
                      with your travel crew.

                    </p>

                  </div>

                ) : (

                  messages.map(

                    (msg, index) => (

                      <div
                        key={index}
                        className="message-row"
                      >

                        <div className="message-bubble">

                          <strong>

                            {

                              msg.sender?.name ||

                              "Traveler"

                            }

                            :

                          </strong>

                          <br />

                          {

                            msg.message

                          }

                        </div>

                      </div>

                    )

                  )

                )

              }

            </div>

            {/* INPUT */}

            <div className="chat-input-wrapper">

              <textarea

                rows="1"

                className="chat-input"

                placeholder="Type your message..."

                value={message}

                onChange={(e) =>

                  setMessage(
                    e.target.value
                  )

                }

              />

              <button

                className="send-btn-modern"

                onClick={sendMessage}

              >

                Send

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Chat;