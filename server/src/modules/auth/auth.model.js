import mongoose from "mongoose";

const userSchema =
  new mongoose.Schema(

    {

      // BASIC INFO

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

      // PROFILE

      bio: {
        type: String,
        default: "",
      },

      profileImage: {
        type: String,
        default: "",
      },

      coverImage: {
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

      // SOCIAL PROFILE

      location: {
        type: String,
        default: "",
      },

      languages: [

        {
          type: String,
        }

      ],

      visitedPlaces: [

        {
          type: String,
        }

      ],

      instagram: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },

      // TRAVEL STATS

      totalTrips: {
        type: Number,
        default: 0,
      },

      friendsCount: {
        type: Number,
        default: 0,
      },

      rating: {
        type: Number,
        default: 5,
      },

      trustScore: {
        type: Number,
        default: 100,
      },

      // FRIEND SYSTEM

      friends: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

      friendRequests: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

      sentRequests: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

      // FOLLOW SYSTEM

      followers: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

      following: [

        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        }

      ],

      // ACCOUNT

      isVerified: {
        type: Boolean,
        default: false,
      },

      // FORGOT PASSWORD OTP

      resetOTP: {
        type: String,
        default: "",
      },

      resetOTPExpire: {
        type: Date,
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
