import express from "express";

import cors from "cors";
import helmet from "helmet";
import { nosqlSanitizer } from "./middleware/nosqlSanitize.middleware.js";
import { xssSanitizer } from "./middleware/xssSanitize.middleware.js";
import { validateObjectIds } from "./middleware/validateObjectIds.middleware.js";

import http from "http";

import jwt from "jsonwebtoken";

import { Server }
  from "socket.io";

import { setIo, getOnlineUsers } from "./utils/socketRegistry.js";

import {
  authenticationLimiter,
  aiChatLimiter,
  aiPackingLimiter,
  aiExpenseLimiter,
  blogsLimiter,
  tripsLimiter,
  messagesLimiter,
  generalLimiter,
} from "./middleware/rateLimiters.js";

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

import Notification from "./modules/notification/notification.model.js";

import activityRoutes from "./modules/activity/activity.routes.js";

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

import blogRoutes
  from "./modules/blog/blog.routes.js";

import timelineRoutes
  from "./modules/timeline/timeline.routes.js";

import tripSaveRoutes
  from "./modules/tripSave/tripSave.routes.js";

import recommendationRoutes
  from "./modules/recommendation/recommendation.routes.js";

import matchRoutes
  from "./modules/match/match.routes.js";

import aiPackingRoutes
  from "./modules/ai/aiPacking.routes.js";

import contactRoutes
  from "./modules/contact/contact.routes.js";

import Trip
  from "./modules/trip/trip.model.js";

const app = express();

// HELMET SECURITY HEADERS (CORS Compatible)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// MIDDLEWARES

app.use(

  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
  })

);

app.use(express.json());

// JSON Parse Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[JSON PARSE ERROR] Invalid JSON payload received');
    console.error(`[JSON PARSE ERROR] Path: ${req.path}, Method: ${req.method}`);
    console.error(`[JSON PARSE ERROR] Payload snippet: ${err.body.substring(0, 200)}`);
    return res.status(400).send({ message: "Invalid JSON payload" });
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

// INPUT SANITIZATION
app.use(nosqlSanitizer);
app.use(xssSanitizer);
app.use(validateObjectIds);

// STATIC FILES

app.use(

  "/uploads",

  express.static("uploads")

);

// DATABASE

connectDB();

// Category migration for legacy notifications
const migrateNotificationCategories = async () => {
  try {
    const friendTypes = ["friend", "follow"];
    const tripTypes = ["join_request", "trip_leave", "trip_remove", "trip_ownership_transfer", "expense"];
    const memoryTypes = ["memory"];
    const reviewTypes = ["review"];
    const chatTypes = ["chat", "message"];

    const r1 = await Notification.updateMany(
      { category: { $exists: false }, type: { $in: friendTypes } },
      { $set: { category: "FRIEND" } }
    );
    const r2 = await Notification.updateMany(
      { category: { $exists: false }, type: { $in: tripTypes } },
      { $set: { category: "TRIP" } }
    );
    const r3 = await Notification.updateMany(
      { category: { $exists: false }, type: { $in: memoryTypes } },
      { $set: { category: "MEMORY" } }
    );
    const r4 = await Notification.updateMany(
      { category: { $exists: false }, type: { $in: reviewTypes } },
      { $set: { category: "REVIEW" } }
    );
    const r5 = await Notification.updateMany(
      { category: { $exists: false }, type: { $in: chatTypes } },
      { $set: { category: "CHAT" } }
    );
    const r6 = await Notification.updateMany(
      { category: { $exists: false } },
      { $set: { category: "SYSTEM" } }
    );

    const totalModified = r1.modifiedCount + r2.modifiedCount + r3.modifiedCount + r4.modifiedCount + r5.modifiedCount + r6.modifiedCount;
    if (totalModified > 0) {
      console.log(`[Migration] Migrated ${totalModified} legacy notifications to categories.`);
    }
  } catch (err) {
    console.error("[Migration] Category migration failed:", err.message);
  }
};
migrateNotificationCategories();

// ROUTES

app.use(
  "/api/auth",
  authenticationLimiter,
  authRoutes
);

app.use(
  "/api/trips",
  tripsLimiter,
  tripRoutes
);

app.use(
  "/api/expenses",
  generalLimiter,
  expenseRoutes
);

app.use(
  "/api/profile",
  generalLimiter,
  profileRoutes
);

app.use(
  "/api/ai",
  generalLimiter,
  aiRoutes
);

app.use(
  "/api/ai/packing",
  aiPackingLimiter,
  aiPackingRoutes
);

app.use(
  "/api/messages",
  messagesLimiter,
  messageRoutes
);

app.use(
  "/api/notifications",
  generalLimiter,
  notificationRoutes
);

app.use(
  "/api/activities",
  generalLimiter,
  activityRoutes
);

app.use(
  "/api/friends",
  generalLimiter,
  friendRoutes
);

app.use(
  "/api/reviews",
  generalLimiter,
  reviewRoutes
);

app.use(
  "/api/dashboard",
  generalLimiter,
  dashboardRoutes
);

app.use(
  "/api/join-requests",
  generalLimiter,
  joinRequestRoutes
);

app.use(
  "/api/memories",
  generalLimiter,
  memoryRoutes
);

app.use(
  "/api/blogs",
  blogsLimiter,
  blogRoutes
);

app.use(
  "/api/timeline",
  timelineRoutes
);

app.use(
  "/api/saves",
  tripSaveRoutes
);

app.use(
  "/api/contact",
  contactRoutes
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

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
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

setIo(io);

// ONLINE USERS

const onlineUsers =
  getOnlineUsers();

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

    // DELETE MESSAGE

    socket.on(

      "delete_message",

      (data) => {

        io.to(data.tripId)

          .emit(

            "message_deleted",

            data

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

// Graceful shutdown handlers for nodemon restarts to prevent EADDRINUSE
const shutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('[Server] MongoDB connection closed.');
      }
      process.exit(0);
    });
    
    // Force close after 2 seconds if hanging
    setTimeout(() => {
      console.error('[Server] Forcing shutdown after timeout.');
      process.exit(1);
    }, 2000);
  } else {
    process.exit(0);
  }
};

process.once('SIGUSR2', () => shutdown('SIGUSR2'));
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n[FATAL ERROR] Port ${PORT} is already in use by another process.`);
    console.error(`[FATAL ERROR] Please kill the process using port ${PORT} or change the PORT in .env\n`);
    process.exit(1);
  } else {
    console.error(`[FATAL ERROR] Server error:`, e);
  }
});