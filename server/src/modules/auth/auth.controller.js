import {
  registerUser,
  loginUser,
  forgotPasswordService,
  verifyOTPService,
  resetPasswordService,
} from "./auth.service.js";

// REGISTER

export const register = async (
  req,
  res
) => {
  try {

    const user =
      await registerUser(
        req.body
      );

    res.status(201).json({
      success: true,
      message:
        "Account created successfully",
      user,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};

// LOGIN

export const login = async (
  req,
  res
) => {
  try {

    const data =
      await loginUser(
        req.body
      );

    res.status(200).json({
      success: true,
      ...data,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};

// FORGOT PASSWORD

export const forgotPassword =
  async (req, res) => {

    try {

      const result =
        await forgotPasswordService(
          req.body.email
        );

      res.status(200).json({
        success: true,
        ...result,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message: err.message,
      });

    }

};

// VERIFY OTP

export const verifyOTP =
  async (req, res) => {

    try {

      const result =
        await verifyOTPService(
          req.body.email,
          req.body.otp
        );

      res.status(200).json({
        success: true,
        ...result,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message: err.message,
      });

    }

};

// RESET PASSWORD

export const resetPassword =
  async (req, res) => {

    try {

      const result =
        await resetPasswordService(
          req.body.email,
          req.body.otp,
          req.body.newPassword
        );

      res.status(200).json({
        success: true,
        ...result,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message: err.message,
      });

    }

};