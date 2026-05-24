import { Server } from "socket.io";

let io;

// INITIALIZE SOCKET

export const initSocket =
  (server) => {

    io = new Server(server, {

      cors: {

        origin:
          "http://localhost:5173",

        methods:
          ["GET", "POST"],

      },

    });

    io.on(
      "connection",
      (socket) => {

        console.log(
          "User connected:",
          socket.id
        );

        // JOIN ROOM

        socket.on(
          "join_trip",
          (tripId) => {

            socket.join(
              tripId
            );

            console.log(
              `Joined room: ${tripId}`
            );

          }
        );

        // SEND MESSAGE

        socket.on(
          "send_message",
          (data) => {

            console.log(
              "Message received:",
              data
            );

            io.to(
              data.tripId
            ).emit(

              "receive_message",

              data

            );

          }
        );

        // DISCONNECT

        socket.on(
          "disconnect",
          () => {

            console.log(
              "User disconnected"
            );

          }
        );

      }
    );

};

// EXPORT SOCKET INSTANCE

export { io };