import express from "express";

import {

  register,

  login,

  forgotPassword,

  verifyOTP,

  resetPassword,

} from "./auth.controller.js";

const router = express.Router();

// REGISTER

router.post(
  "/register",
  register
);

// LOGIN

router.post(
  "/login",
  login
);

// FORGOT PASSWORD

router.post(
  "/forgot-password",
  forgotPassword
);

// VERIFY OTP

router.post(
  "/verify-otp",
  verifyOTP
);

// RESET PASSWORD

router.post(
  "/reset-password",
  resetPassword
);

export default router;