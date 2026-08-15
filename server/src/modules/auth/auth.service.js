import User from "./auth.model.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import {
  generateOTP,
  sendOTPEmail,
} from "../../utils/auth.utils.js";

// REGISTER

export const registerUser =
  async (data) => {

    if (!data) {
      throw new Error("Invalid request data");
    }

    if (!data.name || !data.name.trim()) {
      throw new Error("Name is required");
    }

    if (!data.email || !data.email.trim()) {
      throw new Error("Email is required");
    }

    const email =
      data.email
        .trim()
        .toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {

      throw new Error(
        "Email already exists"
      );

    }

    if (!data.password || data.password.length < 6) {

      throw new Error(
        "Password must be at least 6 characters"
      );

    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
    if (!passwordRegex.test(data.password)) {
      throw new Error(
        "Password must contain at least one uppercase letter and one number"
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10
      );

    const user =
      await User.create({

        ...data,

        email,

        password:
          hashedPassword,

      });

    const safeUser =
      user.toObject();

    delete safeUser.password;

    return safeUser;

};

// LOGIN

export const loginUser =
  async (data) => {

    if (!data) {
      throw new Error("Invalid request data");
    }

    if (!data.email || !data.email.trim()) {
      throw new Error("Email is required");
    }

    if (!data.password) {
      throw new Error("Password is required");
    }

    const user =
      await User.findOne({

        email:
          data.email
            .trim()
            .toLowerCase(),

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    const isMatch =
      await bcrypt.compare(
        data.password,
        user.password
      );

    if (!isMatch) {

      throw new Error(
        "Invalid credentials"
      );

    }

    if (user.isActive === false) {
      user.isActive = true;
      await user.save();
    }

    const token =
      jwt.sign(

        {
          id: user._id,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }

      );

    const safeUser =
      user.toObject();

    delete safeUser.password;

    return {
      user: safeUser,
      token,
    };

};

// FORGOT PASSWORD

export const forgotPasswordService =
  async (email) => {

    const user =
      await User.findOne({

        email:
          email
            .trim()
            .toLowerCase(),

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    const otp =
      generateOTP();

    user.resetOTP = otp;

    user.resetOTPExpire =
      Date.now() +
      10 * 60 * 1000;

    await user.save();

    await sendOTPEmail(
      user.email,
      otp
    );

    return {
      message:
        "OTP sent successfully",
    };

};

// VERIFY OTP

export const verifyOTPService =
  async (
    email,
    otp
  ) => {

    const user =
      await User.findOne({

        email:
          email
            .trim()
            .toLowerCase(),

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    if (
      user.resetOTP !== otp ||
      !user.resetOTPExpire ||
      user.resetOTPExpire <
        Date.now()
    ) {

      throw new Error(
        "Invalid or expired OTP"
      );

    }

    return {
      message:
        "OTP verified successfully",
    };

};

// RESET PASSWORD

export const resetPasswordService =
  async (
    email,
    otp,
    newPassword
  ) => {

    const user =
      await User.findOne({

        email:
          email
            .trim()
            .toLowerCase(),

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    if (
      user.resetOTP !== otp ||
      !user.resetOTPExpire ||
      user.resetOTPExpire <
        Date.now()
    ) {

      throw new Error(
        "Invalid or expired OTP"
      );

    }

    if (
      newPassword.length < 6
    ) {

      throw new Error(
        "Password must be at least 6 characters"
      );

    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    user.resetOTP = null;

    user.resetOTPExpire =
      null;

    await user.save();

    return {

      message:
        "Password reset successful",

    };

};

// EXCHANGE GOOGLE CODE FOR ACCESS TOKEN AND RETRIEVE PROFILE DETAILS
export const verifyGoogleOAuthCodeService = async (code) => {
  if (!code) {
    throw new Error("Authorization code is required from Google redirect");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error("Google OAuth configuration keys are missing in env");
  }

  // 1. Exchange code for access tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Google token exchange failure payload:", errorText);
    throw new Error("Google OAuth authorization code exchange failed");
  }

  const tokens = await tokenResponse.json();
  const accessToken = tokens.access_token;

  if (!accessToken) {
    throw new Error("Google did not return a valid Access Token");
  }

  // 2. Fetch user profile from google userinfo API
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to retrieve Google user profile details");
  }

  const payload = await profileResponse.json();
  return await processGooglePayload(payload);
};

const processGooglePayload = async (payload) => {
  if (!payload.email) {
    throw new Error("Google account profile lacks a valid email address");
  }

  const email = payload.email.trim().toLowerCase();
  let user = await User.findOne({ email });

  if (user) {
    let needsSave = false;
    if (!user.isVerified) {
      user.isVerified = true;
      needsSave = true;
    }
    if (user.isActive === false) {
      user.isActive = true;
      needsSave = true;
    }
    if (needsSave) {
      await user.save();
    }
  } else {
    // Generate secure random password
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "1";
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      name: payload.name || payload.given_name || "Google Traveler",
      email,
      password: hashedPassword,
      profileImage: payload.picture || "",
      isVerified: true
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  console.log("=== JWT SIGN (LOGIN) ===");
  console.log("Issuer location: auth.service.js loginUser");
  console.log(`JWT_SECRET length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : "UNDEFINED"}`);
  console.log(`Token start: ${token.substring(0, 20)}`);
  console.log(`Token end: ${token.substring(token.length - 20)}`);
  console.log("========================");

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  };
};