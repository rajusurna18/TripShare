import mongoose from "mongoose";

const userSchema =
  new mongoose.Schema(

    {

      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
      },

      password: {
        type: String,
        required: true,
      },

      bio: {
        type: String,
        default: "",
      },

      profileImage: {
        type: String,
        default: "",
      },

      interests: [

        {
          type: String,
        }

      ],

      travelStyle: {
        type: String,
        default: "",
      },

      personality: {
        type: String,
        default: "",
      },

      destinationPreference: {
        type: String,
        default: "",
      },

      // FORGOT PASSWORD OTP

      resetOTP: {
        type: String,
        default: "",
      },

      resetOTPExpire: {
        type: Date,
      },

      // EMAIL VERIFICATION

      isVerified: {
        type: Boolean,
        default: false,
      },

    },

    {
      timestamps: true,
    }

  );

export default mongoose.model(
  "User",
  userSchema
);