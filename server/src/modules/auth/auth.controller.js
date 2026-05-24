import {

  registerUser,

  loginUser,

  forgotPasswordService,

  verifyOTPService,

  resetPasswordService,

} from "./auth.service.js";

// REGISTER

export const register =
  async (req, res) => {

    try {

      const user =
        await registerUser(
          req.body
        );

      res.json(user);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};

// LOGIN

export const login =
  async (req, res) => {

    try {

      const data =
        await loginUser(
          req.body
        );

      res.json(data);

    } catch (err) {

      res.status(400).json({

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

      res.json(result);

    } catch (err) {

      res.status(400).json({

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

      res.json(result);

    } catch (err) {

      res.status(400).json({

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

      res.json(result);

    } catch (err) {

      res.status(400).json({

        message: err.message,

      });

    }

};