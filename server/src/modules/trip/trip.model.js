import mongoose from "mongoose";

const tripSchema =
  new mongoose.Schema(

    {

      // BASIC INFO

      title: {

        type: String,

        required: true,

        trim: true,

      },

      destination: {

        type: String,

        required: true,

        trim: true,

      },

      description: {

        type: String,

        default: "",

      },

      image: {

        type: String,

        default: "",

      },

      // TRIP DETAILS

      date: {

        type: Date,

        required: true,

      },

      startDate: {

        type: Date,

      },

      endDate: {

        type: Date,

      },

      budget: {

        type: Number,

        required: true,

        min: 0,

      },

      travelStyle: {

        type: String,

        default: "",

      },

      tags: [

        {

          type: String,

          trim: true,

        },

      ],

      // MEMBERS

      createdBy: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

      },

      members: [

        {

          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",

        },

      ],

      // EXTRA FEATURES

      maxMembers: {

        type: Number,

        default: 10,

      },

      status: {

        type: String,

        enum: [

          "upcoming",

          "active",

          "completed",

          "cancelled",

        ],

        default: "upcoming",

      },

    },

    {

      timestamps: true,

    }

  );

// INDEXES

tripSchema.index({

  destination: 1,

});

tripSchema.index({

  travelStyle: 1,

});

tripSchema.index({

  status: 1,

});

tripSchema.index({

  createdBy: 1,

});

tripSchema.index({

  members: 1,

});

export default mongoose.model(

  "Trip",

  tripSchema

);