import express from "express";
import { getMatches } from "./match.controller.js";

const router = express.Router();

router.get("/:tripId", getMatches);

export default router;