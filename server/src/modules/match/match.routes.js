import express from "express";
import { getMatches } from "./match.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:tripId", protect, getMatches);

export default router;