import express from "express";
import { getFeed } from "./activity.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getFeed);

export default router;
