import {
  registerUser,
  loginUser,
  forgotPasswordService,
  verifyOTPService,
  resetPasswordService,
  verifyGoogleOAuthCodeService,
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

// GOOGLE AUTH REDIRECT
export const googleAuthRedirect = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !callbackUrl) {
      return res.status(400).send("Google OAuth Client ID or Callback URL configuration missing on server.");
    }
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("profile email")}` +
      `&prompt=consent`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google OAuth Redirect error:", err);
    res.status(500).send("Internal Server Error navigating to Google OAuth: " + err.message);
  }
};

// GOOGLE AUTH CALLBACK
export const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Google callback authorization code missing.");
    }
    const data = await verifyGoogleOAuthCodeService(code);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const redirectTarget = `${clientUrl}/login?token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`;
    res.redirect(redirectTarget);
  } catch (err) {
    console.error("Google OAuth Callback exchange error:", err);
    res.status(400).send("Google authentication callback exchange failed: " + err.message);
  }
};