import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import tripRoutes from "./modules/trip/trip.routes.js";
import matchRoutes from "./modules/match/match.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import expenseRoutes from "./modules/expense/expense.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/expenses", expenseRoutes);

app.use("/api/ai", aiRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("TripShare API Running 🚀");
});

export default app;