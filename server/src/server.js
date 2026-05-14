import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import expenseRoutes
from "./modules/expense/expense.routes.js";

import authRoutes
from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});