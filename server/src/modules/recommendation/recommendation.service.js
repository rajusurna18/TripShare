import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";

export const getRecommendationsService =
  async (userId) => {

    const user =
      await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const trips =
      await Trip.find({
        createdBy: { $ne: userId }
      }).populate(
        "createdBy",
        "name profileImage"
      );

    const recommendations =
      trips
        .map((trip) => {

          let score = 0;

          const commonTags =
            trip.tags?.filter(
              tag =>
                user.interests?.includes(tag)
            ) || [];

          score += commonTags.length * 15;

          if (
            user.destinationPreference &&
            trip.destination ===
              user.destinationPreference
          ) {
            score += 30;
          }

          if (
            user.travelStyle &&
            trip.travelStyle ===
              user.travelStyle
          ) {
            score += 25;
          }

          if (
            user.budgetPreference &&
            trip.budget <=
              user.budgetPreference
          ) {
            score += 20;
          }

          return {
            trip,
            score: Math.min(score, 100),
            commonTags,
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    return recommendations;
};