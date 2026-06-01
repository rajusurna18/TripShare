import dotenv from "dotenv";

dotenv.config();

import express from "express";

import cors from "cors";

import http from "http";

import { Server }
from "socket.io";

import connectDB
from "./config/db.js";

import genAI
from "./config/gemini.js";

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
from "./modules/messages/message.routes.js";

import notificationRoutes
from "./modules/notification/notification.routes.js";

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

// STATIC FILES

app.use(

  "/uploads",

  express.static("uploads")

);

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

app.use(
  "/api/notifications",
  notificationRoutes
);

// TEST ROUTE

app.get("/", (req, res) => {

  res.send(
    "API Running 🚀"
  );

});

app.get(

  "/test-ai",

  async (req, res) => {

    try {

      const model =
        genAI.getGenerativeModel({

          model:
            "models/gemini-1.5-flash",

        });

      const result =
        await model.generateContent(

          "Hello"

        );

      const response =
        result.response.text();

      res.json({

        success: true,

        response,

      });

    } catch (err) {

      console.log(err);

      res.json(err);

    }

  }

);

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

// ONLINE USERS

const onlineUsers =
  new Map();

// SOCKET CONNECTION

io.on(

  "connection",

  (socket) => {

    console.log(

      "User Connected:",

      socket.id

    );

    // REGISTER USER

    socket.on(

      "register_user",

      (userId) => {

        onlineUsers.set(
          userId,
          socket.id
        );

        io.emit(

          "online_users",

          Array.from(
            onlineUsers.keys()
          )

        );

        console.log(

          "Online Users:",

          onlineUsers.size

        );

      }

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

        // LIVE MESSAGE

        io.to(data.trip)

          .emit(

            "receive_message",

            data

          );

        // LIVE NOTIFICATION

        socket.to(data.trip)

          .emit(

            "new_notification",

            {

              type: "message",

              text:

                `${data.sender?.name || "Traveler"} sent a message`,

              tripId:

                data.trip,

            }

          );

        console.log(

          "Message Sent:",

          data.message

        );

      }

    );

    // USER TYPING

    socket.on(

      "typing",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "user_typing",

            data

          );

      }

    );

    // STOP TYPING

    socket.on(

      "stop_typing",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "user_stop_typing"

          );

      }

    );

    // MESSAGE SEEN

    socket.on(

      "message_seen",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "message_seen_update",

            {

              messageId:
                data.messageId,

              userId:
                data.userId,

            }

          );

      }

    );

    // DISCONNECT

    socket.on(

      "disconnect",

      () => {

        for (

          const [userId, id]

          of onlineUsers.entries()

        ) {

          if (id === socket.id) {

            onlineUsers.delete(
              userId
            );

            break;

          }

        }

        io.emit(

          "online_users",

          Array.from(
            onlineUsers.keys()
          )

        );

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