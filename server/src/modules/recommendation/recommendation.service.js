import User from "../auth/auth.model.js";

import Trip from "../trip/trip.model.js";

export const getRecommendationsService =
  async (userId) => {

    const user =
      await User.findById(userId);

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    const trips =
      await Trip.find()

        .populate(
          "createdBy",
          "name profileImage"
        );

    const recommendations =
      trips.map((trip) => {

        let score = 0;

        // INTEREST MATCH

        if (
          trip.tags &&
          user.interests
        ) {

          const common =
            trip.tags.filter(
              (tag) =>

                user.interests.includes(
                  tag
                )
            );

          score +=
            common.length * 15;

        }

        // DESTINATION

        if (

          user.destinationPreference &&

          trip.destination ===
          user.destinationPreference

        ) {

          score += 30;

        }

        // TRAVEL STYLE

        if (

          user.travelStyle &&

          trip.travelStyle ===
          user.travelStyle

        ) {

          score += 25;

        }

        if (score > 100) {

          score = 100;

        }

        return {

          trip,

          score,

        };

      });

    recommendations.sort(

      (a, b) =>
        b.score - a.score

    );

    return recommendations;

};