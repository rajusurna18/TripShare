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

      // NEW FIELD

      destinationPreference: {
        type: String,
        default: "",
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