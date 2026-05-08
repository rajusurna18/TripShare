import Trip from "../trip/trip.model.js";

export const findMatchesService = async (tripId) => {

  const currentTrip = await Trip.findById(tripId);

  if (!currentTrip) {
    throw new Error("Trip not found");
  }

  const allTrips = await Trip.find({
    _id: { $ne: tripId },
  });

  const matches = allTrips.map((trip) => {

    let score = 0;

    // Destination Match
    if (
      trip.destination.toLowerCase() ===
      currentTrip.destination.toLowerCase()
    ) {
      score += 40;
    }

    // Budget Similarity
    const budgetDiff = Math.abs(
      trip.budget - currentTrip.budget
    );

    if (budgetDiff <= 2000) {
      score += 30;
    }

    // Date Similarity
    const date1 = new Date(trip.date);
    const date2 = new Date(currentTrip.date);

    const diffDays =
      Math.abs(date1 - date2) /
      (1000 * 60 * 60 * 24);

    if (diffDays <= 5) {
      score += 20;
    }

    return {
      trip,
      score,
    };
  });

  matches.sort((a, b) => b.score - a.score);

  return matches;
};