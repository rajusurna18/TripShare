import express from "express";
import { submitContactForm } from "./contact.controller.js";
import { generalLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", generalLimiter, submitContactForm);

export default router;
