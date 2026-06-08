import Trip from "./trip.model.js";
import User from "../auth/auth.model.js";

import {
  createNotificationService,
} from "../notification/notification.service.js";

// CREATE TRIP

export const createTripService =
  async (tripData, userId) => {

    const trip =
      await Trip.create({

        ...tripData,

        createdBy:
          userId,

        members: [
          userId,
        ],

        travelStyle:
          tripData.travelStyle ||
          "",

        tags:
          tripData.tags || [],

        maxMembers:
          tripData.maxMembers ||
          10,

        status:
          tripData.status ||
          "upcoming",

      });

    return await Trip.findById(
      trip._id
    )

      .populate(
        "createdBy",
        "name email profileImage"
      )

      .populate(
        "members",
        "name profileImage travelStyle"
      );

};

// GET ALL TRIPS

export const getTripsService =
  async (userId) => {

    return await Trip.find({

      $or: [

        {
          createdBy:
            userId,
        },

        {
          members:
            userId,
        },

      ],

    })

      .populate(
        "createdBy",
        "name email profileImage"
      )

      .populate(
        "members",
        "name profileImage travelStyle"
      )

      .sort({
        createdAt: -1,
      });

};

// JOIN TRIP

export const joinTripService =
  async (tripId, userId) => {

    const trip =
      await Trip.findById(
        tripId
      );

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    const alreadyJoined =

      trip.members.some(
        (member) =>

          member.toString() ===
          userId.toString()
      );

    if (alreadyJoined) {

      throw new Error(
        "Already joined this trip"
      );

    }

    if (

      trip.members.length >=
      trip.maxMembers

    ) {

      throw new Error(
        "Trip is full"
      );

    }

    trip.members.push(
      userId
    );

    await trip.save();

    const joinedUser =
  await User.findById(
    userId
  );

await createNotificationService(

  trip.createdBy,

  `${joinedUser.name} joined ${trip.title} 🌍`

);

    return await Trip.findById(
      trip._id
    )

      .populate(
        "createdBy",
        "name email profileImage"
      )

      .populate(
        "members",
        "name profileImage travelStyle"
      );

};

// GET SINGLE TRIP

export const getTripByIdService =
  async (tripId) => {

    const trip =
      await Trip.findById(
        tripId
      )

        .populate(
          "createdBy",
          "name profileImage email"
        )

        .populate(
          "members",
          "name profileImage travelStyle personality interests"
        );

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    const totalMembers =
      trip.members.length;

    const seatsLeft =

      trip.maxMembers -
      totalMembers;

    return {

      ...trip.toObject(),

      totalMembers,

      seatsLeft,

    };

};