import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";

export const findMatchesService =
  async (tripId, currentUserId) => {

    const currentTrip =
      await Trip.findById(tripId);

    if (!currentTrip) {
      throw new Error("Trip not found");
    }

    const currentUser =
      await User.findById(currentUserId);

    if (!currentUser) {
      throw new Error("User not found");
    }

    const users =
      await User.find({
        _id: { $ne: currentUserId },
      });

    const matches =
      users
        .map((user) => {

          let score = 0;

          const commonInterests =
            user.interests.filter(
              interest =>
                currentUser.interests.includes(
                  interest
                )
            );

          score +=
            commonInterests.length * 10;

          if (
            user.travelStyle ===
            currentUser.travelStyle
          ) {
            score += 25;
          }

          if (
            user.personality ===
            currentUser.personality
          ) {
            score += 20;
          }

          if (
            user.destinationPreference ===
            currentTrip.destination
          ) {
            score += 15;
          }

          const commonLanguages =
            user.languages?.filter(
              lang =>
                currentUser.languages?.includes(
                  lang
                )
            ) || [];

          score +=
            commonLanguages.length * 5;

          return {
            user,
            score: Math.min(score, 100),
            commonInterests,
            commonLanguages,
          };
        })
        .filter(item => item.score >= 20)
        .sort((a, b) => b.score - a.score);

    return matches;
};