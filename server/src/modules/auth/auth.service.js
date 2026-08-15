import User from "./auth.model.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import {
  generateOTP,
  sendOTPEmail,
} from "../../utils/auth.utils.js";

export const CURRENT_TERMS_VERSION = "1.0";

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

    if (data.termsAccepted !== true) {
      throw new Error("You must accept the Terms & Conditions to register.");
    }

    const termsAccepted = true;
    const termsVersion = CURRENT_TERMS_VERSION;
    const termsAcceptedAt = new Date();

    const user =
      await User.create({

        ...data,

        email,

        password:
          hashedPassword,

        termsAccepted,
        termsVersion,
        termsAcceptedAt,
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

    return {
      isNewUser: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    };
  } else {
    // New user -> generate short-lived continuation token
    const pendingToken = jwt.sign(
      {
        email,
        name: payload.name || payload.given_name || "Google Traveler",
        picture: payload.picture || "",
        isPendingRegistration: true
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return {
      isNewUser: true,
      pendingToken
    };
  }
};

export const finalizeGoogleRegistrationService = async (pendingToken, termsAccepted) => {
  if (termsAccepted !== true) {
    throw new Error("You must accept the Terms & Conditions to register.");
  }

  if (!pendingToken) {
    throw new Error("Missing Google continuation token");
  }

  let decoded;
  try {
    decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired Google continuation token");
  }

  if (decoded.isPendingRegistration !== true) {
    throw new Error("Invalid token purpose");
  }

  if (!decoded.email) {
    throw new Error("Token missing required identity claims");
  }

  const email = decoded.email.trim().toLowerCase();
  
  // Replay / Race condition protection
  let existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Generate secure random password
  const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "1";
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name: decoded.name,
    email,
    password: hashedPassword,
    profileImage: decoded.picture,
    isVerified: true,
    termsAccepted: true,
    termsVersion: CURRENT_TERMS_VERSION,
    termsAcceptedAt: new Date()
  });

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