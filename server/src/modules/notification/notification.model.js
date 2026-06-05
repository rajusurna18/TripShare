import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(

    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        default: "general",
      },

      link: {
        type: String,
        default: "",
      },

      read: {
        type: Boolean,
        default: false,
      },
    },

    {
      timestamps: true,
    }

  );

export default mongoose.model(
  "Notification",
  notificationSchema
);