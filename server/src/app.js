import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

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