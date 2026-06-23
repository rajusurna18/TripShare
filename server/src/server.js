import dotenv from "dotenv";

dotenv.config();

import express from "express";

import cors from "cors";

import http from "http";

import jwt from "jsonwebtoken";

import { Server }
from "socket.io";

// CUSTOM RATE LIMITER MIDDLEWARE
const rateLimit = (limit, windowMs) => {
  const ipRequests = new Map();
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }
    const timestamps = ipRequests.get(ip).filter(time => now - time < windowMs);
    if (timestamps.length >= limit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests from this IP, please try again later."
      });
    }
    timestamps.push(now);
    ipRequests.set(ip, timestamps);
    next();
  };
};

const authLimiter = rateLimit(30, 60 * 1000); // 30 requests per minute

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

import friendRoutes
from "./modules/friend/friend.routes.js";

import reviewRoutes
from "./modules/review/review.routes.js";

import dashboardRoutes
from "./modules/dashboard/dashboard.routes.js";

import joinRequestRoutes
from "./modules/joinRequest/joinRequest.routes.js";

import memoryRoutes
from "./modules/memory/memory.routes.js";

import recommendationRoutes
from "./modules/recommendation/recommendation.routes.js";

import matchRoutes
from "./modules/match/match.routes.js";

import Trip
from "./modules/trip/trip.model.js";

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
  authLimiter,
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

app.use(
  "/api/friends",
  friendRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/join-requests",
  joinRequestRoutes
);

app.use(
  "/api/memories",
  memoryRoutes
);


app.use(
  "/api/recommendations",

  recommendationRoutes

);

app.use(
  "/api/match",

  matchRoutes

);

// TEST ROUTE

app.get("/", (req, res) => {

  res.send(
    "API Running 🚀"
  );

});

// TEST AI

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

      res.status(500).json({

        success: false,

        error: err.message,

      });

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

// LIVE LOCATIONS

let liveLocations = [];

// SOCKET AUTHENTICATION MIDDLEWARE
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

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

        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

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

      async (tripId) => {

        try {
          const trip = await Trip.findById(tripId);
          if (!trip) {
            console.log(`Socket join rejected: Trip ${tripId} not found`);
            return;
          }
          const userId = socket.user?.id;
          if (!userId) {
            console.log(`Socket join rejected: User not authenticated`);
            return;
          }
          const isCreator = trip.createdBy.toString() === userId.toString();
          const isMember = trip.members.some(
            (member) => member.toString() === userId.toString()
          );
          if (!isCreator && !isMember) {
            console.log(`Socket join rejected: User ${userId} is not a member of Trip ${tripId}`);
            return;
          }

          socket.join(tripId);

          console.log(
            `Joined Room: ${tripId}`
          );
        } catch (err) {
          console.error("Socket join error:", err.message);
        }

      }

    );

    // LIVE LOCATION

    socket.on(

      "live_location",

      (data) => {

        const existingUser =
          liveLocations.find(

            (user) =>

              user.userId ===
              data.userId

          );

        if (existingUser) {

          existingUser.lat =
            data.lat;

          existingUser.lng =
            data.lng;

        } else {

          liveLocations.push(
            data
          );

        }

        io.to(data.tripId)

          .emit(

            "update_locations",

            liveLocations

          );

      }

    );

    // SEND MESSAGE

    socket.on(

      "send_message",

      (data) => {

        io.to(data.trip)

          .emit(

            "receive_message",

            data

          );

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

    // MESSAGE REACTION

    socket.on(

      "message_reaction",

      (data) => {

        io.to(data.tripId)

          .emit(

            "message_reaction_update",

            data

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

    // =========================
    // VIDEO CALL FEATURE
    // =========================

    // START VIDEO CALL

    socket.on(

      "start_video_call",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "incoming_video_call",

            data

          );

        console.log(

          `${data.caller} started video call`

        );

      }

    );

    // END VIDEO CALL

    socket.on(

      "end_video_call",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "video_call_ended"

          );

      }

    );

    // WEBRTC OFFER

    socket.on(

      "webrtc_offer",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "webrtc_offer",

            data

          );

      }

    );

    // WEBRTC ANSWER

    socket.on(

      "webrtc_answer",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "webrtc_answer",

            data

          );

      }

    );

    // ICE CANDIDATES

    socket.on(

      "ice_candidate",

      (data) => {

        socket.to(data.tripId)

          .emit(

            "ice_candidate",

            data

          );

      }

    );

    // DISCONNECT

    socket.on(

      "disconnect",

      () => {

        for (

          const [userId, socketsSet]

          of onlineUsers.entries()

        ) {

          if (socketsSet.has(socket.id)) {

            socketsSet.delete(socket.id);

            if (socketsSet.size === 0) {

              onlineUsers.delete(
                userId
              );

            }

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