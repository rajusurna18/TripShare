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