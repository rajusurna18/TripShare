import { io }
from "socket.io-client";

const socket =
  io(

    "http://localhost:5000",

    {

      autoConnect: false,

      transports: [

        "websocket",

      ],

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,

      timeout: 20000,

    }

  );

// CONNECTION EVENTS

socket.on(

  "connect",

  () => {

    console.log(

      "✅ Socket Connected:",

      socket.id

    );

  }

);

socket.on(

  "disconnect",

  () => {

    console.log(

      "❌ Socket Disconnected"

    );

  }

);

socket.on(

  "connect_error",

  (err) => {

    console.log(

      "⚠ Socket Error:",

      err.message

    );

  }

);

export default socket;