import mongoose from "mongoose";

const userSchema =
  new mongoose.Schema(

    {
      // BASIC INFO

      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
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

      interests: {
        type: [String],
        default: [],
      },

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

      languages: {
        type: [String],
        default: [],
      },

      visitedPlaces: {
        type: [String],
        default: [],
      },

      instagram: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },

      github: {
      type: String,
     default: "",
     },

    linkedin: {
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

      averageRating: {
        type: Number,
        default: 5,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },

     completedTrips: {
     type: Number,
     default: 0,
    },

   joinedTrips: {
    type: Number,
    default: 0,
   },

      // FRIEND SYSTEM

      friends: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      // FOLLOW SYSTEM

      followers: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      following: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      // ACCOUNT

      isVerified: {
        type: Boolean,
        default: false,
      },

      // RESET PASSWORD

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

userSchema.index({
  email: 1,
});

export default mongoose.model(
  "User",
  userSchema
);