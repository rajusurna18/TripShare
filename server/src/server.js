import dotenv from "dotenv";

dotenv.config();

import express from "express";

import cors from "cors";

import http from "http";

import { Server }
from "socket.io";

import connectDB
from "./config/db.js";

// ROUTES

import authRoutes
from "./modules/auth/auth.routes.js";

import tripRoutes
from "./modules/trip/trip.routes.js";

import expenseRoutes
from "./modules/expense/expense.routes.js";

import aiRoutes
from "./modules/ai/ai.routes.js";

import profileRoutes
from "./modules/profile/profile.routes.js";

import messageRoutes
from "./modules/message/message.routes.js";

const app = express();

// MIDDLEWARES

app.use(

  cors({

    origin:
      "http://localhost:5173",

    credentials: true,

  })

);

app.use(express.json());

// DATABASE

connectDB();

// ROUTES

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/trips",
  tripRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

// TEST ROUTE

app.get("/", (req, res) => {

  res.send(
    "API Running 🚀"
  );

});

// HTTP SERVER

const server =
  http.createServer(app);

// SOCKET.IO

const io = new Server(

  server,

  {

    cors: {

      origin:
        "http://localhost:5173",

      methods:
        ["GET", "POST"],

    },

  }

);

// SOCKET CONNECTION

io.on(

  "connection",

  (socket) => {

    console.log(

      "User Connected:",

      socket.id

    );

    // JOIN TRIP ROOM

    socket.on(

      "join_trip",

      (tripId) => {

        socket.join(tripId);

        console.log(
          `Joined Room: ${tripId}`
        );

      }

    );

    // SEND MESSAGE

    socket.on(

      "send_message",

      (data) => {

        io.to(data.tripId)

          .emit(

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
          "User Disconnected"
        );

      }

    );

  }

);

// SERVER

const PORT =
  process.env.PORT || 5000;

server.listen(

  PORT,

  () => {

    console.log(

      `Server running on port ${PORT}`

    );

  }

);