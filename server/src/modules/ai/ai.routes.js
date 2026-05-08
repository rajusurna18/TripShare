import express from "express";
import { getTripSuggestions } from "./ai.controller.js";

const router = express.Router();

router.post("/suggest", getTripSuggestions);

export default router;