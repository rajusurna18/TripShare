import { Server } from "socket.io";

let io;

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // Join trip room
    socket.on("join_trip", (tripId) => {

      socket.join(tripId);

      console.log(`Joined room: ${tripId}`);
    });

    // Send message
    socket.on("send_message", (data) => {

      io.to(data.tripId).emit(
        "receive_message",
        data
      );
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export { io };