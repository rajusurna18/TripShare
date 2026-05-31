import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

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

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [connected, setConnected] =
    useState(false);

  const [typingUser, setTypingUser] =
    useState("");

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  // FILE + AUDIO

  const [file, setFile] =
    useState(null);

  const [mediaRecorder, setMediaRecorder] =
    useState(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [audioBlob, setAudioBlob] =
    useState(null);

  const messagesEndRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  // SAFE USER

  const currentUser =
    JSON.parse(

      localStorage.getItem(
        "user"
      ) || "{}"

    );

  // TRIP ID

  const { tripId } =
    useParams();

  // NO ACTIVE TRIP

  if (!tripId) {

    return (

      <div className="chat-page min-vh-100 d-flex justify-content-center align-items-center text-light">

        <div className="text-center">

          <h1 className="mb-3">

            💬 No Active Trip

          </h1>

          <p className="text-secondary mb-4">

            Create or join a trip
            to start chatting.

          </p>

          <Link
            to="/trips"
            className="btn btn-warning"
          >

            Open Trips

          </Link>

        </div>

      </div>

    );

  }

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
          res.data.trip || res.data
        );

      } catch (err) {

        console.log(err);

        setError(
          "Failed to load trip"
        );

      }

  };

  // FETCH MESSAGES

  const fetchMessages =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await API.get(

            `/messages/${tripId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        setMessages(
          res.data.messages || []
        );

      } catch (err) {

        console.log(err);

        setError(
          "Failed to load messages"
        );

      } finally {

        setLoading(false);

      }

  };

  // AUTO SCROLL

  const scrollToBottom =
    () => {

      messagesEndRef.current
        ?.scrollIntoView({

          behavior:
            "smooth",

        });

  };

  // START RECORDING

  const startRecording =
    async () => {

      try {

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({

              audio: true,

            });

        const recorder =
          new MediaRecorder(
            stream
          );

        let chunks = [];

        recorder.ondataavailable =
          (e) => {

            chunks.push(e.data);

          };

        recorder.onstop =
          () => {

            const blob =
              new Blob(

                chunks,

                {

                  type:
                    "audio/webm",

                }

              );

            setAudioBlob(blob);

          };

        recorder.start();

        setMediaRecorder(
          recorder
        );

        setIsRecording(true);

      } catch (err) {

        console.log(err);

      }

  };

  // STOP RECORDING

  const stopRecording =
    () => {

      mediaRecorder.stop();

      setIsRecording(false);

  };

  // INITIAL LOAD

  useEffect(() => {

    fetchTrip();

    fetchMessages();

    // SOCKET CONNECT

    if (!socket.connected) {

      socket.connect();

    }

    socket.on(
      "connect",
      () => {

        setConnected(true);

      }
    );

    socket.on(
      "disconnect",
      () => {

        setConnected(false);

      }
    );

    // JOIN ROOM

    socket.emit(
      "join_trip",
      tripId
    );

    // REGISTER USER

    socket.emit(

      "register_user",

      currentUser?._id

    );

    // RECEIVE MESSAGE

    socket.on(

      "receive_message",

      (data) => {

        setMessages((prev) => {

          const exists =
            prev.find(

              (msg) =>

                msg._id ===
                data._id

            );

          if (exists)
            return prev;

          return [

            ...prev,

            data,

          ];

        });

      }

    );

    // ONLINE USERS

    socket.on(

      "online_users",

      (users) => {

        setOnlineUsers(users);

      }

    );

    // USER TYPING

    socket.on(

      "user_typing",

      (data) => {

        setTypingUser(

          `${data.name} is typing...`

        );

      }

    );

    // STOP TYPING

    socket.on(

      "user_stop_typing",

      () => {

        setTypingUser("");

      }

    );

    // MESSAGE SEEN

    socket.on(

      "message_seen_update",

      (data) => {

        setMessages((prev) =>

          prev.map((msg) =>

            msg._id ===
            data.messageId

              ? {

                  ...msg,

                  seen: true,

                }

              : msg

          )

        );

      }

    );

    return () => {

      socket.off(
        "receive_message"
      );

      socket.off(
        "online_users"
      );

      socket.off(
        "user_typing"
      );

      socket.off(
        "user_stop_typing"
      );

      socket.off(
        "message_seen_update"
      );

      socket.off("connect");

      socket.off(
        "disconnect"
      );

    };

  }, [tripId]);

  // AUTO SCROLL

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  // SEND MESSAGE

  const sendMessage =
    async () => {

      if (
        (
          !message.trim() &&
          !file &&
          !audioBlob
        ) ||
        sending
      ) return;

      try {

        setSending(true);

        setError("");

        const token =
          localStorage.getItem(
            "token"
          );

        const formData =
          new FormData();

        formData.append(
          "trip",
          tripId
        );

        formData.append(
          "message",
          message
        );

        if (file) {

          formData.append(
            "file",
            file
          );

        }

        if (audioBlob) {

          formData.append(

            "audio",

            audioBlob,

            "voice.webm"

          );

        }

        const res =
          await API.post(

            "/messages",

            formData,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "multipart/form-data",

              },

            }

          );

        const savedMessage =
          res.data.data;

        socket.emit(

          "send_message",

          savedMessage

        );

        setMessages((prev) => [

          ...prev,

          savedMessage,

        ]);

        setMessage("");

        setFile(null);

        setAudioBlob(null);

      } catch (err) {

        console.log(err);

        setError(
          "Failed to send message"
        );

      } finally {

        setSending(false);

      }

  };

  // LOADING

  if (loading) {

    return (

      <div className="chat-page min-vh-100 d-flex justify-content-center align-items-center text-light">

        <div className="text-center">

          <div
            className="spinner-border text-warning mb-3"
          />

          <h4>

            Loading Messages...

          </h4>

        </div>

      </div>

    );

  }

  return (

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        paddingTop: "40px",
      }}
    >

      <div className="container py-5">

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >

          {/* SIDEBAR */}

          <div
            style={{
              width: "300px",
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "20px",
            }}
          >

            <h2>

              🌍 TripShare

            </h2>

            <p>

              Active Group

            </p>

            <div
              style={{
                background: "#2a2a2a",
                padding: "15px",
                borderRadius: "12px",
              }}
            >

              ✈ {

                trip?.title ||

                "Travel Group"

              }

            </div>

          </div>

          {/* MAIN */}

          <div
            style={{
              flex: 1,
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "20px",
              minHeight: "80vh",
            }}
          >

            {/* TOP */}

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h3>

                  {

                    trip?.title ||

                    "Travel Group Chat"

                  }

                </h3>

                <span>

                  {

                    trip?.members
                      ?.length || 0

                  }

                  {" "}

                  travelers connected •

                  <span className="text-success">

                    {" "}

                    {

                      onlineUsers.length

                    }

                    {" "}online

                  </span>

                </span>

              </div>

              <div>

                {

                  connected

                    ? (

                      <span className="text-success">

                        🟢 Live

                      </span>

                    )

                    : (

                      <span className="text-danger">

                        🔴 Offline

                      </span>

                    )

                }

              </div>

            </div>

            {/* ERROR */}

            {

              error && (

                <div className="alert alert-danger">

                  {error}

                </div>

              )

            }

            {/* CHAT */}

            <div
              style={{
                height: "500px",
                overflowY: "auto",
                background: "#151515",
                borderRadius: "15px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >

              {

                messages.length === 0 ? (

                  <div className="text-center mt-5">

                    <h2>

                      💬 No Messages Yet

                    </h2>

                    <p>

                      Start the conversation.

                    </p>

                  </div>

                ) : (

                  messages.map(
                    (msg) => (

                      <div

                        key={msg._id}

                        style={{
                          display: "flex",
                          justifyContent:

                            msg.sender?._id ===
                            currentUser?._id

                              ? "flex-end"

                              : "flex-start",

                          marginBottom: "15px",
                        }}

                      >

                        <div
                          style={{
                            background:

                              msg.sender?._id ===
                              currentUser?._id

                                ? "#ffc107"

                                : "#2a2a2a",

                            color:

                              msg.sender?._id ===
                              currentUser?._id

                                ? "#000"

                                : "#fff",

                            padding: "12px",
                            borderRadius: "15px",
                            maxWidth: "70%",
                          }}
                        >

                          <strong>

                            {

                              msg.sender
                                ?.name ||

                              "Traveler"

                            }

                          </strong>

                          <p className="m-0 mt-2">

                            {

                              msg.message

                            }

                          </p>

                          {/* FILE */}

                          {

                            msg.fileUrl && (

                              <a

                                href={`http://localhost:5000/${msg.fileUrl}`}

                                target="_blank"

                                rel="noreferrer"

                                className="d-block mt-2 text-info"

                              >

                                📎 Open File

                              </a>

                            )

                          }

                          {/* AUDIO */}

                          {

                            msg.audioUrl && (

                              <audio
                                controls
                                className="mt-2"
                              >

                                <source

                                  src={`http://localhost:5000/${msg.audioUrl}`}

                                  type="audio/webm"

                                />

                              </audio>

                            )

                          }

                          {/* SEEN STATUS */}

                          {

                            msg.sender?._id ===
                            currentUser?._id && (

                              <small
                                style={{
                                  fontSize: "12px",
                                  opacity: 0.7,
                                }}
                              >

                                {

                                  msg.seen

                                    ? "✓✓ Seen"

                                    : "✓ Sent"

                                }

                              </small>

                            )

                          }

                        </div>

                      </div>

                    )
                  )

                )

              }

              <div
                ref={
                  messagesEndRef
                }
              />

            </div>

            {/* TYPING */}

            {

              typingUser && (

                <p className="text-warning mb-2">

                  {typingUser}

                </p>

              )

            }

            {/* INPUT */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >

              <textarea

                rows="1"

                className="form-control"

                placeholder="Type your message..."

                value={message}

                onChange={(e) => {

                  setMessage(
                    e.target.value
                  );

                  socket.emit(

                    "typing",

                    {

                      tripId,

                      name:

                        currentUser?.name ||

                        "Traveler",

                    }

                  );

                  clearTimeout(

                    typingTimeoutRef.current

                  );

                  typingTimeoutRef.current =
                    setTimeout(() => {

                      socket.emit(

                        "stop_typing",

                        {

                          tripId,

                        }

                      );

                    }, 1000);

                }}

                onKeyDown={(e) => {

                  if (

                    e.key === "Enter" &&

                    !e.shiftKey

                  ) {

                    e.preventDefault();

                    sendMessage();

                  }

                }}

              />

              {/* FILE */}

              <input

                type="file"

                className="form-control"

                onChange={(e) =>

                  setFile(
                    e.target.files[0]
                  )

                }

              />

              {/* RECORD */}

              <button

                className="btn btn-danger"

                onClick={

                  isRecording

                    ? stopRecording

                    : startRecording

                }

              >

                {

                  isRecording

                    ? "⏹ Stop"

                    : "🎤 Record"

                }

              </button>

              {/* SEND */}

              <button

                className="btn btn-warning"

                onClick={
                  sendMessage
                }

                disabled={
                  sending
                }

              >

                {

                  sending
                    ? "Sending..."
                    : "Send"

                }

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Chat;