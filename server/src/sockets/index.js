import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Trip from "../modules/trip/trip.model.js";

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

    // Enforce JWT handshake authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
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
          async (tripId) => {
            try {
              const trip = await Trip.findById(tripId);
              if (!trip) {
                return socket.emit("error_msg", { message: "Trip not found" });
              }
              const isCreator = trip.createdBy.toString() === socket.user.id.toString();
              const isMember = trip.members.some(
                (m) => m.toString() === socket.user.id.toString()
              );
              if (!isCreator && !isMember) {
                return socket.emit("error_msg", { message: "Access denied: You are not a member of this trip" });
              }
              socket.join(tripId);
              console.log(`User ${socket.user.id} joined room: ${tripId}`);
            } catch (err) {
              socket.emit("error_msg", { message: "Failed to join room" });
            }
          }
        );

        // SEND MESSAGE

        socket.on(
          "send_message",
          async (data) => {
            try {
              const trip = await Trip.findById(data.tripId);
              if (!trip) {
                return socket.emit("error_msg", { message: "Trip not found" });
              }
              const isCreator = trip.createdBy.toString() === socket.user.id.toString();
              const isMember = trip.members.some(
                (m) => m.toString() === socket.user.id.toString()
              );
              if (!isCreator && !isMember) {
                return socket.emit("error_msg", { message: "Access denied" });
              }

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
            } catch (err) {
              socket.emit("error_msg", { message: "Failed to send message" });
            }
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