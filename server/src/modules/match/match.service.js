import User from "../auth/auth.model.js";
import Trip from "../trip/trip.model.js";
import mongoose from "mongoose";

export const findMatchesService =
  async (tripId, currentUserId, page = 1, limit = 12) => {

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

    const currentUserInterests = currentUser.interests || [];

    const facetResult = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
        },
      },
      {
        $addFields: {
          commonInterests: {
            $setIntersection: [
              { $ifNull: ["$interests", []] },
              currentUserInterests,
            ],
          },
          commonVisited: {
            $setIntersection: [
              { $ifNull: ["$visitedPlaces", []] },
              currentUser.visitedPlaces || [],
            ],
          },
          commonLanguages: {
            $setIntersection: [
              { $ifNull: ["$languages", []] },
              currentUser.languages || [],
            ],
          },
        },
      },
      {
        $addFields: {
          scoreDest: {
            $cond: [
              { $eq: ["$destinationPreference", currentTrip.destination] },
              25,
              0,
            ],
          },
          scoreInterests: {
            $multiply: [
              {
                $min: [
                  1.0,
                  {
                    $divide: [
                      { $size: { $ifNull: ["$commonInterests", []] } },
                      3,
                    ],
                  },
                ],
              },
              20,
            ],
          },
          scoreStyle: {
            $cond: [
              { $eq: ["$travelStyle", currentUser.travelStyle] },
              15,
              0,
            ],
          },
          scoreBudget: {
            $cond: [
              { $eq: [{ $ifNull: ["$budgetPreference", 0] }, 0] },
              7.5,
              {
                $multiply: [
                  {
                    $max: [
                      0,
                      {
                        $subtract: [
                          1,
                          {
                            $divide: [
                              {
                                $abs: {
                                  $subtract: [
                                    currentTrip.budget,
                                    { $ifNull: ["$budgetPreference", 0] },
                                  ],
                                },
                              },
                              {
                                $max: [
                                  currentTrip.budget,
                                  { $ifNull: ["$budgetPreference", 1] },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  15,
                ],
              },
            ],
          },
          scorePersonality: {
            $cond: [
              { $eq: ["$personality", currentUser.personality] },
              10,
              {
                $cond: [
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ["$personality", "Introvert"] },
                          { $eq: [currentUser.personality, "Extrovert"] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ["$personality", "Extrovert"] },
                          { $eq: [currentUser.personality, "Introvert"] },
                        ],
                      },
                    ],
                  },
                  8,
                  {
                    $cond: [
                      {
                        $and: [
                          { $ne: [{ $ifNull: ["$personality", ""] }, ""] },
                          {
                            $ne: [
                              { $ifNull: [currentUser.personality, ""] },
                              "",
                            ],
                          },
                        ],
                      },
                      3,
                      0,
                    ],
                  },
                ],
              },
            ],
          },
          scoreCategory: {
            $multiply: [
              {
                $min: [
                  1.0,
                  {
                    $divide: [
                      {
                        $size: {
                          $setIntersection: [
                            { $ifNull: ["$preferredTripCategories", []] },
                            currentTrip.tags || [],
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              10,
            ],
          },
          scoreHistoryVisited: {
            $multiply: [
              { $min: [1.0, { $size: { $ifNull: ["$commonVisited", []] } }] },
              2.5,
            ],
          },
          scoreHistoryExperience: {
            $multiply: [
              {
                $max: [
                  0,
                  {
                    $subtract: [
                      1,
                      {
                        $divide: [
                          {
                            $abs: {
                              $subtract: [
                                { $ifNull: ["$completedTrips", 0] },
                                currentUser.completedTrips || 0,
                              ],
                            },
                          },
                          {
                            $max: [
                              1,
                              {
                                $add: [
                                  { $ifNull: ["$completedTrips", 0] },
                                  currentUser.completedTrips || 0,
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              2.5,
            ],
          },
        },
      },
      {
        $addFields: {
          score: {
            $round: [
              {
                $add: [
                  "$scoreDest",
                  "$scoreInterests",
                  "$scoreStyle",
                  "$scoreBudget",
                  "$scorePersonality",
                  "$scoreCategory",
                  "$scoreHistoryVisited",
                  "$scoreHistoryExperience",
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          score: { $gte: 20 },
        },
      },
      {
        $sort: {
          score: -1,
          trustScore: -1,
          averageRating: -1,
          profileCompletion: -1,
        },
      },
      {
        $project: {
          password: 0,
          resetOTP: 0,
          resetOTPExpire: 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    const totalCount = facetResult[0]?.metadata[0]?.total || 0;
    const matchesData = facetResult[0]?.data || [];

    const formattedMatches = matchesData.map(user => ({
      user,
      score: user.score,
      commonInterests: user.commonInterests || [],
      commonLanguages: user.commonLanguages || [],
    }));

    return {
      matches: formattedMatches,
      total: totalCount,
      page,
      limit,
    };
};