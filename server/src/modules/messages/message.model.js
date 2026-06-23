import mongoose from "mongoose";

const messageSchema =
  new mongoose.Schema(

    {

      // SENDER

      sender: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      // TRIP

      trip: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Trip",

        required: true,

      },

      // MESSAGE TEXT

      message: {

        type: String,

        default: "",

        trim: true,

      },

      // FILE URL

      fileUrl: {

        type: String,

        default: "",

      },

      // FILE TYPE

      fileType: {

        type: String,

        default: "",

      },

      // AUDIO URL

      audioUrl: {

        type: String,

        default: "",

      },

      // SEEN STATUS

      seen: {

        type: Boolean,

        default: false,

      },

      // EDIT STATUS

      isEdited: {

        type: Boolean,

        default: false,

      },

      // USERS WHO READ MESSAGE

      readBy: [

        {

          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",

        },

      ],

      // MESSAGE REACTIONS

      reactions: [

        {

          user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

          },

          emoji: {

            type: String,

            required: true,

          },

        },

      ],

    },

    {

      timestamps: true,

    }

  );

// FAST CHAT FETCHING

messageSchema.index({

  trip: 1,

  createdAt: -1,

});

export default mongoose.model(

  "Message",

  messageSchema

);