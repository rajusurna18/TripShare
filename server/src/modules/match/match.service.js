import User from "../auth/auth.model.js";

import Trip from "../trip/trip.model.js";

export const findMatchesService =
  async (tripId, currentUserId) => {

    // CURRENT TRIP

    const currentTrip =
      await Trip.findById(tripId);

    if (!currentTrip) {

      throw new Error(
        "Trip not found"
      );

    }

    // CURRENT USER

    const currentUser =
      await User.findById(
        currentUserId
      );

    if (!currentUser) {

      throw new Error(
        "User not found"
      );

    }

    // OTHER USERS

    const users =
      await User.find({

        _id: {
          $ne: currentUserId,
        },

      });

    const matches = users.map(
      (user) => {

        let score = 0;

        // =====================
        // INTEREST MATCH
        // =====================

        const commonInterests =

          user.interests.filter(
            (interest) =>

              currentUser.interests.includes(
                interest
              )

          );

        score +=
          commonInterests.length * 10;

        // =====================
        // TRAVEL STYLE
        // =====================

        if (

          user.travelStyle &&
          user.travelStyle ===
          currentUser.travelStyle

        ) {

          score += 25;

        }

        // =====================
        // PERSONALITY
        // =====================

        if (

          user.personality &&
          user.personality ===
          currentUser.personality

        ) {

          score += 20;

        }

        // =====================
        // DESTINATION MATCH
        // =====================

        if (

          user.destinationPreference &&
          user.destinationPreference ===
          currentTrip.destination

        ) {

          score += 15;

        }

        // =====================
        // FINAL LIMIT
        // =====================

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

    // SORT HIGH → LOW

    matches.sort(

      (a, b) =>
        b.score - a.score

    );

    return matches;

};