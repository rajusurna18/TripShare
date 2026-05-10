import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const tripId = "YOUR_TRIP_ID";

  useEffect(() => {

    socket.emit("join_trip", tripId);

    socket.on("receive_message", (data) => {

      setMessages((prev) => [...prev, data]);

    });

    return () => {

      socket.off("receive_message");

    };

  }, []);

  const sendMessage = () => {

    if (!message.trim()) return;

    socket.emit("send_message", {
      tripId,
      text: message,
    });

    setMessage("");

  };

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <h1 className="section-title">
          Travel Chat 💬
        </h1>

        <div className="chat-box">

          {
            messages.map((msg, index) => (

              <div
                key={index}
                className="message"
              >
                {msg.text}
              </div>

            ))
          }

        </div>

        <div className="d-flex gap-3 mt-4">

          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <button
            className="btn btn-custom"
            onClick={sendMessage}
          >
            Send
          </button>

        </div>

      </div>

    </div>

  );
}

export default Chat;