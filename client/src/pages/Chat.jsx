
import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import API from "../services/api";

import socket from "../socket";

function Chat() {

  // ======================
  // STATES
  // ======================

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

  // VIDEO CALL

  const [callActive, setCallActive] =
    useState(false);

  const [localStream, setLocalStream] =
    useState(null);

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  // REFS

  const messagesEndRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  // USER

  const currentUser =
    JSON.parse(

      localStorage.getItem(
        "user"
      ) || "{}"

    );

  // PARAMS

  const { tripId } =
    useParams();

  // ======================
  // NO TRIP
  // ======================

  if (!tripId) {

    return (

      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light">

        <div className="text-center">

          <h1>

            💬 No Active Trip

          </h1>

          <Link
            to="/trips"
            className="btn btn-warning mt-3"
          >

            Open Trips

          </Link>

        </div>

      </div>

    );

  }

  // ======================
  // FETCH TRIP
  // ======================

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

      }

  };

  // ======================
  // FETCH MESSAGES
  // ======================

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

      } finally {

        setLoading(false);

      }

  };

  // ======================
  // AUTO SCROLL
  // ======================

  const scrollToBottom =
    () => {

      messagesEndRef.current
        ?.scrollIntoView({

          behavior:
            "smooth",

        });

  };

  // ======================
  // RECORD AUDIO
  // ======================

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

  const stopRecording =
    () => {

      mediaRecorder.stop();

      setIsRecording(false);

  };

  // ======================
  // VIDEO CALL
  // ======================

  const startVideoCall =
    async () => {

      try {

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({

              video: true,

              audio: true,

            });

        setLocalStream(stream);

        setCallActive(true);

        if (
          localVideoRef.current
        ) {

          localVideoRef.current.srcObject =
            stream;

        }

        socket.emit(

          "start_video_call",

          {

            tripId,

            caller:
              currentUser?.name,

          }

        );

      } catch (err) {

        console.log(err);

      }

  };

  const endVideoCall =
    () => {

      if (localStream) {

        localStream
          .getTracks()
          .forEach((track) => {

            track.stop();

          });

      }

      setCallActive(false);

      socket.emit(

        "end_video_call",

        {

          tripId,

        }

      );

  };

  // ======================
  // INITIAL LOAD
  // ======================

  useEffect(() => {

    fetchTrip();

    fetchMessages();

    if (!socket.connected) {

      socket.connect();

    }

    socket.emit(
      "join_trip",
      tripId
    );

    socket.emit(

      "register_user",

      currentUser?._id

    );

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

    // RECEIVE MESSAGE

    socket.on(

      "receive_message",

      (data) => {

        setMessages((prev) => [

          ...prev,

          data,

        ]);

      }

    );

    // ONLINE USERS

    socket.on(

      "online_users",

      (users) => {

        setOnlineUsers(users);

      }

    );

    // TYPING

    socket.on(

      "user_typing",

      (data) => {

        setTypingUser(

          `${data.name} is typing...`

        );

      }

    );

    socket.on(

      "user_stop_typing",

      () => {

        setTypingUser("");

      }

    );

    // VIDEO CALL

    socket.on(

      "incoming_video_call",

      (data) => {

        alert(

          `${data.caller} started a video call 📞`

        );

      }

    );

    socket.on(

      "video_call_ended",

      () => {

        setCallActive(false);

        if (localStream) {

          localStream
            .getTracks()
            .forEach((track) => {

              track.stop();

            });

        }

        alert(
          "Call ended 📴"
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
        "incoming_video_call"
      );

      socket.off(
        "video_call_ended"
      );

    };

  }, [tripId]);

  // ======================
  // AUTO SCROLL
  // ======================

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  // ======================
  // SEND MESSAGE
  // ======================

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

        socket.emit(

          "send_message",

          res.data.data

        );

        setMessages((prev) => [

          ...prev,

          res.data.data,

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

  // ======================
  // LOADING
  // ======================

  if (loading) {

    return <h2>Loading...</h2>;

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

        {/* TOP */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2>

              {

                trip?.title ||

                "Travel Chat"

              }

            </h2>

            <p>

              {

                onlineUsers.length

              }

              {" "}online

            </p>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >

            <button

              className="btn btn-success"

              onClick={
                startVideoCall
              }

            >

              📞 Video Call

            </button>

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

        {/* VIDEO */}

        {

          callActive && (

            <div className="mb-4">

              <video

                ref={localVideoRef}

                autoPlay

                muted

                playsInline

                style={{
                  width: "300px",
                  borderRadius: "15px",
                  background: "#000",
                }}

              />

              <button

                className="btn btn-danger mt-3"

                onClick={
                  endVideoCall
                }

              >

                ❌ End Call

              </button>

            </div>

          )

        }

        {/* CHAT */}

        <div
          style={{
            height: "500px",
            overflowY: "auto",
            background: "#1e1e1e",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >

          {

            messages.map(
              (msg) => (

                <div
                  key={msg._id}
                  style={{
                    marginBottom: "15px",
                  }}
                >

                  <strong>

                    {

                      msg.sender?.name ||

                      "Traveler"

                    }

                  </strong>

                  <p>

                    {msg.message}

                  </p>

                  {

                    msg.audioUrl && (

                      <audio
                        controls
                      >

                        <source

                          src={`http://localhost:5000/${msg.audioUrl}`}

                          type="audio/webm"

                        />

                      </audio>

                    )

                  }

                </div>

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

            <p className="text-warning">

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

            placeholder="Type message..."

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
                    currentUser?.name,

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

          />

          <input

            type="file"

            className="form-control"

            onChange={(e) =>

              setFile(
                e.target.files[0]
              )

            }

          />

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

          <button

            className="btn btn-warning"

            onClick={
              sendMessage
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

  );

}

export default Chat;

