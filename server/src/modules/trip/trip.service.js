export const joinTripService =
  async (tripId, userId) => {

    const trip =
      await Trip.findById(tripId);

    if (!trip)
      throw new Error("Trip not found");

    if (
      trip.members.includes(userId)
    ) {
      throw new Error(
        "Already joined"
      );
    }

    trip.members.push(userId);

    await trip.save();

    // 🔔 Notification

    await createNotificationService(
      trip.createdBy,
      "Someone joined your trip 🚀"
    );

    return trip;
};