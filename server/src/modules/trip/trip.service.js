import Trip from "./trip.model.js";

export const createTripService = async (data, userId) => {
  const trip = await Trip.create({
    ...data,
    createdBy: userId,
    members: [userId],
  });

  return trip;
};

export const getTripsService = async () => {
  return await Trip.find()
    .populate("createdBy", "name email")
    .populate("members", "name email");
};

export const joinTripService = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);

  if (!trip) throw new Error("Trip not found");

  if (trip.members.includes(userId)) {
    throw new Error("Already joined");
  }

  trip.members.push(userId);

  await trip.save();

  return trip;
};