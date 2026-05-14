import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import expenseRoutes
from "./modules/expense/expense.routes.js";

import authRoutes
from "./modules/auth/auth.routes.js";

import aiRoutes
from "./modules/ai/ai.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

connectDB();

// Routes
app.use("/api/ai", aiRoutes);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  console.log(
    "User Connected:",
    socket.id
  );

  socket.on("disconnect", () => {

    console.log(
      "User Disconnected"
    );

  });

});

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});