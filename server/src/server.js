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

import mongoose from "mongoose";

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

import settingsRoutes
  from "./modules/settings/settings.routes.js";

import Trip
  from "./modules/trip/trip.model.js";

const app = express();

// TRUST PROXY (Required for Render reverse proxy & express-rate-limit)
app.set("trust proxy", 1);
console.log(`[Express Config] Trust proxy setting initialized: ${app.get("trust proxy")}`);

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
  "/api/settings",
  generalLimiter,
  settingsRoutes
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
        process.env.CLIENT_URL || "http://localhost:5173",

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

// HELPER FOR SOCKET ROOM ID EXTRACTION
const getTripRoomId = (data) => {
  if (!data) return null;
  if (typeof data.trip === "object" && data.trip?._id) return data.trip._id.toString();
  if (typeof data.trip === "string" && data.trip) return data.trip;
  if (typeof data.tripId === "object" && data.tripId?._id) return data.tripId._id.toString();
  if (typeof data.tripId === "string" && data.tripId) return data.tripId;
  return null;
};

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
        if (!userId) return;
        const uIdStr = typeof userId === "object" ? (userId._id || userId.id)?.toString() : userId.toString();

        if (!onlineUsers.has(uIdStr)) {
          onlineUsers.set(uIdStr, new Set());
        }
        onlineUsers.get(uIdStr).add(socket.id);

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

          socket.join(tripId.toString());

          console.log(
            `[Socket] User ${userId} joined room: ${tripId}`
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

        const roomId = getTripRoomId(data);
        if (roomId) {
          io.to(roomId).emit("update_locations", liveLocations);
        }

      }

    );

    // SEND MESSAGE

    socket.on(

      "send_message",

      (data) => {

        const roomId = getTripRoomId(data);
        if (!roomId) {
          console.error("Socket error: Missing trip room ID in send_message event");
          return;
        }

        console.log(`[Socket] Broadcasting receive_message to room: ${roomId}`);

        io.to(roomId)

          .emit(

            "receive_message",

            data

          );

        socket.to(roomId)

          .emit(

            "new_notification",

            {

              type: "message",

              text:

                `${data.sender?.name || "Traveler"} sent a message`,

              tripId:
                roomId,

            }

          );

      }

    );

    // DELETE MESSAGE

    socket.on(

      "delete_message",

      (data) => {

        const roomId = getTripRoomId(data);
        if (roomId) {
          io.to(roomId).emit("message_deleted", data);
        }

      }

    );

    // MESSAGE REACTION

    socket.on(

      "message_reaction",

      (data) => {

        const roomId = getTripRoomId(data);
        if (roomId) {
          io.to(roomId).emit("message_reaction_update", data);
        }

      }

    );

    // USER TYPING

    socket.on(

      "typing",

      (data) => {

        const roomId = getTripRoomId(data);
        if (roomId) {
          socket.to(roomId).emit("user_typing", data);
        }

      }

    );

    // STOP TYPING

    socket.on(

      "stop_typing",

      (data) => {

        const roomId = getTripRoomId(data);
        if (roomId) {
          socket.to(roomId).emit("user_stop_typing");
        }

      }

    );

    // MESSAGE SEEN

    socket.on(

      "message_seen",

      (data) => {

        const roomId = getTripRoomId(data);
        if (roomId) {
          socket.to(roomId).emit("message_seen_update", {
            messageId: data.messageId,
            userId: data.userId,
          });
        }

      }

    );

// IN-MEMORY GROUP CALLS REGISTRY
// Map<tripId, { tripId, callType, callerId, callerName, callerAvatar, participants: Map<userId, { userId, name, avatar, socketId, muted, videoOff }> }>
const activeGroupCalls = new Map();

    // ==========================================
    // GROUP VOICE & VIDEO CALLING (WhatsApp Style)
    // ==========================================

    socket.on("start_group_call", (data) => {
      const { tripId, callType, callerId, callerName, callerAvatar } = data;
      if (!tripId || !callerId) return;

      const tIdStr = tripId.toString();
      const uIdStr = callerId.toString();

      let callState = activeGroupCalls.get(tIdStr);
      if (!callState) {
        callState = {
          tripId: tIdStr,
          callType: callType || "voice",
          callerId: uIdStr,
          callerName: callerName || "Traveler",
          callerAvatar: callerAvatar || "",
          participants: new Map(),
        };
        activeGroupCalls.set(tIdStr, callState);
      } else {
        callState.callType = callType || callState.callType;
      }

      callState.participants.set(uIdStr, {
        userId: uIdStr,
        name: callerName || "Traveler",
        avatar: callerAvatar || "",
        socketId: socket.id,
        muted: false,
        videoOff: callType === "voice",
      });

      const payload = {
        tripId: tIdStr,
        callType: callState.callType,
        callerId: uIdStr,
        callerName: callerName || "Traveler",
        callerAvatar: callerAvatar || "",
        participants: Array.from(callState.participants.values()),
      };

      // Notify other trip room members
      socket.to(tIdStr).emit("incoming_group_call", payload);
      socket.emit("group_call_state", payload);

      console.log(`[Group Call] ${callerName} started ${callState.callType} call in trip ${tIdStr}`);
    });

    socket.on("join_group_call", (data) => {
      const { tripId, userId, name, avatar } = data;
      if (!tripId || !userId) return;

      const tIdStr = tripId.toString();
      const uIdStr = userId.toString();

      let callState = activeGroupCalls.get(tIdStr);
      if (!callState) {
        callState = {
          tripId: tIdStr,
          callType: data.callType || "voice",
          callerId: uIdStr,
          callerName: name || "Traveler",
          callerAvatar: avatar || "",
          participants: new Map(),
        };
        activeGroupCalls.set(tIdStr, callState);
      }

      callState.participants.set(uIdStr, {
        userId: uIdStr,
        name: name || "Traveler",
        avatar: avatar || "",
        socketId: socket.id,
        muted: false,
        videoOff: callState.callType === "voice",
      });

      const participantList = Array.from(callState.participants.values());
      const payload = {
        tripId: tIdStr,
        callType: callState.callType,
        userId: uIdStr,
        name: name || "Traveler",
        avatar: avatar || "",
        socketId: socket.id,
        participants: participantList,
      };

      socket.to(tIdStr).emit("group_call_user_joined", payload);
      socket.emit("group_call_state", payload);

      console.log(`[Group Call] ${name} joined ${callState.callType} call in trip ${tIdStr}`);
    });

    socket.on("group_webrtc_offer", (data) => {
      const { targetUserId } = data;
      emitToTargetUser(targetUserId, "group_webrtc_offer", data);
    });

    socket.on("group_webrtc_answer", (data) => {
      const { targetUserId } = data;
      emitToTargetUser(targetUserId, "group_webrtc_answer", data);
    });

    socket.on("group_ice_candidate", (data) => {
      const { targetUserId } = data;
      emitToTargetUser(targetUserId, "group_ice_candidate", data);
    });

    socket.on("toggle_group_media", (data) => {
      const { tripId, userId, muted, videoOff } = data;
      if (!tripId || !userId) return;
      const tIdStr = tripId.toString();
      const uIdStr = userId.toString();

      const callState = activeGroupCalls.get(tIdStr);
      if (callState && callState.participants.has(uIdStr)) {
        const p = callState.participants.get(uIdStr);
        if (typeof muted === "boolean") p.muted = muted;
        if (typeof videoOff === "boolean") p.videoOff = videoOff;

        socket.to(tIdStr).emit("group_media_updated", {
          tripId: tIdStr,
          userId: uIdStr,
          muted: p.muted,
          videoOff: p.videoOff,
        });
      }
    });

    socket.on("leave_group_call", (data) => {
      const { tripId, userId } = data;
      if (!tripId || !userId) return;
      const tIdStr = tripId.toString();
      const uIdStr = userId.toString();

      const callState = activeGroupCalls.get(tIdStr);
      if (callState) {
        callState.participants.delete(uIdStr);
        socket.to(tIdStr).emit("group_call_user_left", {
          tripId: tIdStr,
          userId: uIdStr,
          remainingParticipants: Array.from(callState.participants.values()),
        });

        console.log(`[Group Call] User ${uIdStr} left group call in trip ${tIdStr}`);

        if (callState.participants.size === 0) {
          activeGroupCalls.delete(tIdStr);
          io.to(tIdStr).emit("group_call_ended", { tripId: tIdStr });
          console.log(`[Group Call] Group call in trip ${tIdStr} ended (all participants left)`);
        }
      }
    });

    socket.on("reject_group_call", (data) => {
      const { tripId, userId } = data;
      if (!tripId || !userId) return;
      const tIdStr = tripId.toString();
      const uIdStr = userId.toString();

      socket.to(tIdStr).emit("group_call_rejected", { tripId: tIdStr, userId: uIdStr });
    });

    // =========================
    // ONE-TO-ONE VIDEO CALL BACKWARD COMPATIBILITY
    // =========================
    
    const emitToTargetUser = (targetId, event, data) => {
      if (!targetId) return;
      const targetIdStr = typeof targetId === "object" ? (targetId._id || targetId.id)?.toString() : targetId.toString();
      let sentCount = 0;
      if (onlineUsers.has(targetIdStr)) {
        const socketIds = onlineUsers.get(targetIdStr);
        socketIds.forEach(id => {
          io.to(id).emit(event, data);
          sentCount++;
        });
      }
      
      const roomId = getTripRoomId(data);
      if (roomId) {
        socket.to(roomId).emit(event, data);
      }
    };

    socket.on("start_call", (data) => {
      emitToTargetUser(data.targetId, "incoming_call", data);
    });

    socket.on("start_video_call", (data) => {
      emitToTargetUser(data.targetId, "incoming_video_call", data);
      emitToTargetUser(data.targetId, "incoming_call", { ...data, callType: "video" });
    });

    socket.on("accept_call", (data) => {
      emitToTargetUser(data.targetId, "call_accepted", data);
    });

    socket.on("end_call", (data) => {
      emitToTargetUser(data.targetId, "call_ended", data);
    });

    socket.on("end_video_call", (data) => {
      emitToTargetUser(data.targetId, "video_call_ended", data);
      emitToTargetUser(data.targetId, "call_ended", data);
    });

    socket.on("reject_call", (data) => {
      emitToTargetUser(data.targetId, "call_rejected", data);
    });

    socket.on("video_call_rejected", (data) => {
      emitToTargetUser(data.targetId, "video_call_rejected", data);
      emitToTargetUser(data.targetId, "call_rejected", data);
    });

    socket.on("webrtc_offer", (data) => {
      emitToTargetUser(data.targetId, "webrtc_offer", data);
    });

    socket.on("webrtc_answer", (data) => {
      emitToTargetUser(data.targetId, "webrtc_answer", data);
    });

    socket.on("ice_candidate", (data) => {
      emitToTargetUser(data.targetId, "ice_candidate", data);
    });

    // DISCONNECT

    socket.on("disconnect", () => {
      for (const [userId, socketsSet] of onlineUsers.entries()) {
        if (socketsSet.has(socket.id)) {
          socketsSet.delete(socket.id);
          if (socketsSet.size === 0) {
            onlineUsers.delete(userId);
          }
          break;
        }
      }

      // Cleanup user from active group calls on disconnect
      if (socket.user && (socket.user._id || socket.user.id)) {
        const uIdStr = (socket.user._id || socket.user.id).toString();
        for (const [tIdStr, callState] of activeGroupCalls.entries()) {
          if (callState.participants.has(uIdStr)) {
            callState.participants.delete(uIdStr);
            socket.to(tIdStr).emit("group_call_user_left", {
              tripId: tIdStr,
              userId: uIdStr,
              remainingParticipants: Array.from(callState.participants.values()),
            });

            if (callState.participants.size === 0) {
              activeGroupCalls.delete(tIdStr);
              io.to(tIdStr).emit("group_call_ended", { tripId: tIdStr });
            }
          }
        }
      }

      if (socket.user && socket.user.id) {
        socket.broadcast.emit("peer_disconnected", { userId: socket.user.id });
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
      console.log("User Disconnected");
    });

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