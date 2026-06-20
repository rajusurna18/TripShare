import { calculateProfileCompletionDetails, calculateTrustScore } from "../modules/profile/profile.service.js";

// Test runners
const assertEqual = (actual, expected, testName) => {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    process.exit(1);
  }
};

const runTests = () => {
  console.log("Starting Profile Foundation Verification Tests...\n");

  // TEST 1: Profile Completion for empty user
  const emptyUser = {
    name: "",
    profileImage: "",
    bio: "",
    location: "",
    travelStyle: "",
    interests: [],
    languages: [],
    visitedPlaces: [],
    personality: "",
    destinationPreference: "",
  };

  const emptyCompletion = calculateProfileCompletionDetails(emptyUser);
  assertEqual(emptyCompletion.percentage, 0, "Empty user has 0% profile completion");
  assertEqual(emptyCompletion.missingFields.length, 11, "Empty user has 11 missing fields");

  // TEST 2: Profile Completion for partially filled user
  const partialUser = {
    name: "John Doe",
    profileImage: "https://cloudinary.com/avatar.jpg",
    bio: "Hi there!",
    location: "New York",
    travelStyle: "Adventure",
  };
  const partialCompletion = calculateProfileCompletionDetails(partialUser);
  // Completed: Name, Profile Image, Bio, Location, Travel Style = 5 fields out of 11.
  // 5 / 11 * 100 = 45.45 => round(45)
  assertEqual(partialCompletion.percentage, 45, "Partially filled user has 45% profile completion");
  assertEqual(
    partialCompletion.missingFields,
    ["Interests", "Languages", "Visited Places", "Personality", "Destination Preference", "Social Links"],
    "Identifies missing fields correctly"
  );

  // TEST 3: Profile Completion for fully filled user
  const fullUser = {
    name: "John Doe",
    profileImage: "image_url",
    bio: "Bio",
    location: "Loc",
    travelStyle: "Style",
    interests: ["Adventure"],
    languages: ["English"],
    visitedPlaces: ["Rome"],
    personality: "Introvert",
    destinationPreference: "Mountains",
    instagram: "john_doe",
  };
  const fullCompletion = calculateProfileCompletionDetails(fullUser);
  assertEqual(fullCompletion.percentage, 100, "Fully filled user has 100% profile completion");
  assertEqual(fullCompletion.missingFields, [], "Fully filled user has no missing fields");

  // TEST 4: Trust Score for base unverified user
  const statsEmpty = { tripsCreated: 0, tripsJoined: 0, reviewsCount: 0, reviews: [] };
  const baseScore = calculateTrustScore(emptyUser, statsEmpty);
  // Base: 10. No verified, no photo, no bio, no location, no social, no friends, no trips. Total = 10
  assertEqual(baseScore, 10, "Base unverified user has a trust score of 10");

  // TEST 5: Trust Score for premium user
  const premiumUser = {
    isVerified: true,
    profileImage: "https://cloudinary.com/avatar.jpg",
    bio: "Bio present",
    location: "London",
    instagram: "premium_insta",
    friends: ["1", "2", "3"],
  };
  const premiumStats = {
    tripsCreated: 2, // 2 * 5 = 10
    tripsJoined: 3,  // 3 * 5 = 15
    reviewsCount: 1,
    reviews: [{ rating: 5 }], // avg >= 4.0 => +10
  };
  // Calculations:
  // Base: 10
  // Verified: +20
  // Image: +15
  // Bio: +10
  // Location: +5
  // Social: +5
  // Friends: 3 * 2 = +6
  // Trips Created: 2 * 5 = +10
  // Trips Joined: 3 * 5 = +15
  // Reviews avg >= 4: +10
  // Total: 10 + 20 + 15 + 10 + 5 + 5 + 6 + 10 + 15 + 10 = 106 => capped at 100
  const premiumScore = calculateTrustScore(premiumUser, premiumStats);
  assertEqual(premiumScore, 100, "Premium user achieves maximum trust score of 100");

  console.log("\nAll profile engine verification tests passed successfully! 🚀");
};

runTests();
