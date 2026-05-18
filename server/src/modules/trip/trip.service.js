import Trip from "./trip.model.js";

// CREATE TRIP

export const createTripService =
  async (tripData, userId) => {

    const trip =
      await Trip.create({

        ...tripData,

        createdBy: userId,

      });

    return trip;

};

// GET ALL TRIPS

export const getTripsService =
  async () => {

    return await Trip.find()

      .populate(
        "createdBy",
        "name email profileImage"
      );

};

// JOIN TRIP

export const joinTripService =
  async (tripId, userId) => {

    const trip =
      await Trip.findById(tripId);

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    if (
      trip.members.includes(userId)
    ) {

      throw new Error(
        "Already joined"
      );

    }

    trip.members.push(userId);

    await trip.save();

    return trip;

};

// GET SINGLE TRIP

export const getTripByIdService =
  async (tripId) => {

    const trip =
      await Trip.findById(tripId)

        .populate(
          "createdBy",
          "name profileImage email"
        )

        .populate(
          "members",
          "name profileImage travelStyle"
        );

    if (!trip) {

      throw new Error(
        "Trip not found"
      );

    }

    return trip;

};