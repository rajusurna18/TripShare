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
      // STAGE 1: Indexed Pre-Filtering (O(N) -> O(K) Reduction)
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
          $or: [
            { destinationPreference: currentTrip.destination },
            { travelStyle: currentUser.travelStyle }
          ]
        },
      },
      // Limit candidate pool size to prevent database aggregation CPU bottlenecks
      {
        $limit: 1000
      },
      // Calculate intersection sets
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
          intersectionCategory: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$preferredTripCategories", []] },
                currentTrip.tags || [],
              ]
            }
          },
          unionCategory: {
            $size: {
              $setUnion: [
                { $ifNull: ["$preferredTripCategories", []] },
                currentTrip.tags || [],
              ]
            }
          },
          // Char match for MBTI (MBTI compatibility dimensions check)
          char1Match: { $cond: [{ $eq: [{ $substrCP: [{ $ifNull: ["$mbti", ""] }, 0, 1] }, { $substrCP: [currentUser.mbti || "", 0, 1] }] }, 1, 0] },
          char2Match: { $cond: [{ $eq: [{ $substrCP: [{ $ifNull: ["$mbti", ""] }, 1, 1] }, { $substrCP: [currentUser.mbti || "", 1, 1] }] }, 1, 0] },
          char3Match: { $cond: [{ $eq: [{ $substrCP: [{ $ifNull: ["$mbti", ""] }, 2, 1] }, { $substrCP: [currentUser.mbti || "", 2, 1] }] }, 1, 0] },
          char4Match: { $cond: [{ $eq: [{ $substrCP: [{ $ifNull: ["$mbti", ""] }, 3, 1] }, { $substrCP: [currentUser.mbti || "", 3, 1] }] }, 1, 0] }
        },
      },
      // Calculate Stage 2 compatibility scores (total weights = 100)
      {
        $addFields: {
          scoreDest: {
            $cond: [
              { $eq: ["$destinationPreference", currentTrip.destination] },
              20,
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
          // Budget range check: full 15 points if trip budget fits within user's min/max range, decay outside
          scoreBudget: {
            $cond: [
              {
                $and: [
                  { $gte: [currentTrip.budget, { $ifNull: ["$budgetRange.min", 0] }] },
                  { $lte: [currentTrip.budget, { $ifNull: ["$budgetRange.max", 0] }] }
                ]
              },
              15,
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
                                $min: [
                                  { $abs: { $subtract: [currentTrip.budget, { $ifNull: ["$budgetRange.min", 0] }] } },
                                  { $abs: { $subtract: [currentTrip.budget, { $ifNull: ["$budgetRange.max", 0] }] } }
                                ]
                              },
                              { $max: [currentTrip.budget, 1] }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  15
                ]
              }
            ]
          },
          // MBTI Personality Overlaps: Max 10 points
          scorePersonality: {
            $multiply: [
              {
                $divide: [
                  { $add: ["$char1Match", "$char2Match", "$char3Match", "$char4Match"] },
                  4
                ]
              },
              10
            ]
          },
          // Trip Category Overlaps (Jaccard similarity): Max 10 points
          scoreCategory: {
            $cond: [
              { $eq: ["$unionCategory", 0] },
              5, // Fallback default
              {
                $multiply: [
                  { $divide: ["$intersectionCategory", "$unionCategory"] },
                  10
                ]
              }
            ]
          },
          // Travel History (visited intersection + frequency similarity): Max 5 points
          scoreHistory: {
            $add: [
              {
                $multiply: [
                  { $min: [1.0, { $size: { $ifNull: ["$commonVisited", []] } }] },
                  2.5
                ]
              },
              {
                $cond: [
                  { $eq: [{ $ifNull: ["$travelFrequency", "medium"] }, { $ifNull: [currentUser.travelFrequency, "medium"] }] },
                  2.5,
                  0
                ]
              }
            ]
          },
          // Language Compatibility: Max 5 points
          scoreLanguage: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$commonLanguages", []] } }, 0] },
              5,
              0
            ]
          }
        },
      },
      // Compile final aggregate scores
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
                  "$scoreHistory",
                  "$scoreLanguage"
                ],
              },
              0,
            ],
          },
        },
      },
      // Filter out low compatible records
      {
        $match: {
          score: { $gte: 20 },
        },
      },
      // Rank matched elements (using primary scores, then tie-breakers)
      {
        $sort: {
          score: -1,
          trustScore: -1,
          averageRating: -1,
          profileCompletion: -1,
        },
      },
      // Redact sensitive credentials
      {
        $project: {
          password: 0,
          resetOTP: 0,
          resetOTPExpire: 0,
        },
      },
      // Facet paginator
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
      scoreBreakdown: {
        destination: user.scoreDest || 0,
        interests: user.scoreInterests || 0,
        travelStyle: user.scoreStyle || 0,
        budget: user.scoreBudget || 0,
        personality: user.scorePersonality || 0,
        category: user.scoreCategory || 0,
        history: user.scoreHistory || 0,
        language: user.scoreLanguage || 0
      },
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