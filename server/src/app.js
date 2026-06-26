
import express from "express";
import cors from "cors";

import authRoutes
from "./modules/auth/auth.routes.js";

import tripRoutes
from "./modules/trip/trip.routes.js";

import matchRoutes
from "./modules/match/match.routes.js";

import aiRoutes
from "./modules/ai/ai.routes.js";

import expenseRoutes
from "./modules/expense/expense.routes.js";

import notificationRoutes
from "./modules/notification/notification.routes.js";

import messageRoutes
from "./modules/message/message.routes.js";

import profileRoutes
from "./modules/profile/profile.routes.js";

import blogRoutes
from "./modules/blog/blog.routes.js";

import tripSaveRoutes
from "./modules/tripSave/tripSave.routes.js";

import { protect }
from "./middleware/auth.middleware.js";

const app = express();

// CORS

app.use(

  cors({

    origin:
      process.env.CLIENT_URL ||

      "http://localhost:5173",

    credentials: true,

  })

);

// BODY PARSER

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// STATIC UPLOADS

app.use(
  "/uploads",
  express.static("uploads")
);

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
  "/api/match",
  matchRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/blogs",
  blogRoutes
);

app.use(
  "/api/saves",
  tripSaveRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

// TEST PROTECTED ROUTE

app.get(

  "/api/protected",

  protect,

  (req, res) => {

    res.json({

      success: true,

      message:
        "Protected route working 🚀",

      user: req.user,

    });

  }

);

// HEALTH CHECK

app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "TripShare API Running 🚀",

  });

});

// 404 HANDLER

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      "Route not found",

  });

});

// GLOBAL ERROR HANDLER

app.use(

  (err, req, res, next) => {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Internal Server Error",

    });

  }

);

export default app;

