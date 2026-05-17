import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";

export const findMatchesService =
  async (tripId, currentUserId) => {

    // Current Trip
    const currentTrip =
      await Trip.findById(tripId);

    if (!currentTrip) {

      throw new Error(
        "Trip not found"
      );

    }

    // Current User
    const currentUser =
      await User.findById(
        currentUserId
      );

    // Other Users
    const users =
      await User.find({
        _id: {
          $ne: currentUserId,
        },
      });

    const matches = users.map(
      (user) => {

        let score = 0;

        // =========================
        // INTERESTS MATCH
        // =========================

        const commonInterests =
          user.interests.filter(
            (interest) =>
              currentUser.interests.includes(
                interest
              )
          );

        score +=
          commonInterests.length * 10;

        // =========================
        // TRAVEL STYLE
        // =========================

        if (
          user.travelStyle ===
          currentUser.travelStyle
        ) {

          score += 25;

        }

        // =========================
        // PERSONALITY
        // =========================

        if (
          user.personality ===
          currentUser.personality
        ) {

          score += 20;

        }

        // =========================
        // DESTINATION MATCH
        // =========================

        const userTrips =
          currentTrip.destination
            ? 15
            : 0;

        score += userTrips;

        // =========================
        // BUDGET SIMILARITY
        // =========================

        if (
          currentTrip.budget
        ) {

          const budgetDiff =
            Math.abs(
              Number(
                currentTrip.budget
              ) - 10000
            );

          if (
            budgetDiff <= 2000
          ) {

            score += 15;

          }

        }

        // =========================
        // FINAL SCORE LIMIT
        // =========================

        if (score > 100) {

          score = 100;

        }

        return {

          user,
          score,
          commonInterests,

        };

      }
    );

    // SORT HIGH TO LOW

    matches.sort(
      (a, b) =>
        b.score - a.score
    );

    return matches;

};