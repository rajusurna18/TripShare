import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // TEMP trip id
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

    const data = {
      tripId,
      text: message,
    };

    socket.emit("send_message", data);

    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Trip Chat 💬</h1>

      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px"
        }}
      >

        {
          messages.map((msg, index) => (
            <p key={index}>
              {msg.text}
            </p>
          ))
        }

      </div>

      <input
        type="text"
        placeholder="Type message..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button onClick={sendMessage}>
        Send
      </button>

    </div>
  );
}

export default Chat;