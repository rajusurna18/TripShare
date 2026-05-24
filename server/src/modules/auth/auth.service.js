import User from "./auth.model.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import {

  generateOTP,

  sendOTPEmail,

} from "../../utils/auth.utils.js";

// REGISTER USER

export const registerUser =
  async (data) => {

    // CHECK EXISTING EMAIL

    const existingUser =
      await User.findOne({

        email: data.email,

      });

    if (existingUser) {

      throw new Error(
        "Email already exists"
      );

    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10
      );

    // CREATE USER

    const user =
      await User.create({

        ...data,

        password:
          hashedPassword,

      });

    return user;

};

// LOGIN USER

export const loginUser =
  async (data) => {

    const user =
      await User.findOne({

        email: data.email,

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // CHECK PASSWORD

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

    // JWT TOKEN

    const token =
      jwt.sign(

        {
          id: user._id,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }

      );

    return {

      user,

      token,

    };

};

// FORGOT PASSWORD

export const forgotPasswordService =
  async (email) => {

    const user =
      await User.findOne({

        email,

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // GENERATE OTP

    const otp =
      generateOTP();

    // SAVE OTP

    user.resetOTP = otp;

    user.resetOTPExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    // SEND EMAIL

    await sendOTPEmail(
      email,
      otp
    );

    return {

      message:
        "OTP sent successfully",

    };

};

// VERIFY OTP

export const verifyOTPService =
  async (email, otp) => {

    const user =
      await User.findOne({

        email,

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // CHECK OTP

    if (

      user.resetOTP !== otp ||

      user.resetOTPExpire < Date.now()

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

        email,

      });

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    // VERIFY OTP

    if (

      user.resetOTP !== otp ||

      user.resetOTPExpire < Date.now()

    ) {

      throw new Error(
        "Invalid or expired OTP"
      );

    }

    // HASH NEW PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    // CLEAR OTP

    user.resetOTP = "";

    user.resetOTPExpire = null;

    await user.save();

    return {

      message:
        "Password reset successful",

    };

};