import Trip from "./trip.model.js";

// CREATE TRIP

export const createTripService =
  async (tripData, userId) => {

    const trip =
      await Trip.create({

        ...tripData,

        createdBy: userId,

        members: [userId],

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

      createdBy: userId,

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

    trip.members.push(userId);

    await trip.save();

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

    return {

      ...trip.toObject(),

      totalMembers,

    };

};