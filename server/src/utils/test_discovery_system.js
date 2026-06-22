import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import connectDB from "../config/db.js";
import { getDiscoverTravelersService } from "../modules/profile/profile.service.js";

const assertEqual = (actual, expected, testName) => {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    process.exit(1);
  }
};

const runTests = async () => {
  try {
    console.log("Connecting to database for traveler discovery tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test users
    await User.deleteMany({ email: /test_discovery_.*@example\.com/ });

    // Create 3 test users with distinct styles and details to test relevancies and filtering
    const userA = await User.create({
      name: "Alice Explorer",
      email: "test_discovery_a@example.com",
      password: "password123",
      travelStyle: "Backpacker",
      personality: "Introverted",
      destinationPreference: "Paris",
      interests: ["hiking", "museums"],
      trustScore: 80,
      profileCompletion: 90,
      followersCount: 5,
      followingCount: 2,
    });

    const userB = await User.create({
      name: "Bob Adventurer",
      email: "test_discovery_b@example.com",
      password: "password123",
      travelStyle: "Solo Adventurer",
      personality: "Extroverted",
      destinationPreference: "Paris",
      interests: ["hiking", "camping"],
      trustScore: 60,
      profileCompletion: 70,
      followersCount: 15,
      followingCount: 8,
      followers: [userA._id] // userA follows userB
    });

    // Make userA follow userB in database collections
    await User.findByIdAndUpdate(userA._id, { $addToSet: { following: userB._id } });

    const userC = await User.create({
      name: "Charlie Foodie",
      email: "test_discovery_c@example.com",
      password: "password123",
      travelStyle: "Foodie Wanderer",
      personality: "Spontaneous",
      destinationPreference: "Rome",
      interests: ["cooking", "wine"],
      trustScore: 40,
      profileCompletion: 50,
      followersCount: 0,
      followingCount: 0,
    });

    console.log("Test users and follow relationships instantiated.\n");

    // TEST 1: Search by partial case-insensitive Name
    const searchByName = await getDiscoverTravelersService({ query: "alice" }, userC._id);
    assertEqual(searchByName.travelers.length, 1, "Should discover exactly 1 user for 'alice'");
    assertEqual(searchByName.travelers[0].name, "Alice Explorer", "Returned traveler matches Alice");

    // TEST 2: Search by Interests
    const searchByInterest = await getDiscoverTravelersService({ query: "hiking" }, userC._id);
    assertEqual(searchByInterest.travelers.length, 2, "Should find 2 travelers interested in hiking");

    // TEST 3: Match Filters (Travel Style & Personality)
    const filteredSearch = await getDiscoverTravelersService({
      travelStyle: "Backpacker",
      personality: "Introverted"
    }, userC._id);
    assertEqual(filteredSearch.travelers.length, 1, "Should find 1 introverted backpacker");
    assertEqual(filteredSearch.travelers[0].name, "Alice Explorer", "Filtered traveler is Alice");

    // TEST 4: Numeric Stats Filters (Trust Score Range)
    const trustScoreSearch = await getDiscoverTravelersService({
      minTrustScore: 70
    }, userC._id);
    assertEqual(trustScoreSearch.travelers.length, 1, "Should find 1 user with trust score >= 70");
    assertEqual(trustScoreSearch.travelers[0].name, "Alice Explorer", "Trust matching traveler is Alice");

    // TEST 5: Sorting by Followers (Most Followed)
    const sortedSearch = await getDiscoverTravelersService({
      sortBy: "followed"
    }, userC._id);
    assertEqual(sortedSearch.travelers[0].name, "Bob Adventurer", "Bob is most followed and should rank first");

    // TEST 6: Projection Safety check (Ensure passwords & emails are not leaked)
    const travelerRecord = searchByName.travelers[0];
    assertEqual(travelerRecord.password, undefined, "Search payload must NOT contain password field");
    assertEqual(travelerRecord.email, undefined, "Search payload must NOT contain email field");

    // TEST 7: Follow Integration Check
    // userA follows userB. Search as userA should return isFollowing: true for userB
    const followStatusSearch = await getDiscoverTravelersService({ query: "Bob" }, userA._id);
    assertEqual(followStatusSearch.travelers[0].isFollowing, true, "isFollowing is true for followed user B");

    // Search as userC (does not follow userB) should return isFollowing: false for userB
    const notFollowStatusSearch = await getDiscoverTravelersService({ query: "Bob" }, userC._id);
    assertEqual(notFollowStatusSearch.travelers[0].isFollowing, false, "isFollowing is false for unfollowed user B");

    // TEST 8: Pagination verification
    const paginatedSearch = await getDiscoverTravelersService({
      page: 1,
      limit: 1
    }, userC._id);
    assertEqual(paginatedSearch.limit, 1, "Pagination page size matches input");
    assertEqual(paginatedSearch.travelers.length, 1, "Returns exactly 1 traveler per pagination limit");
    assertEqual(paginatedSearch.hasNextPage, true, "hasNextPage is true since there are more travelers");

    // Cleanup test users
    await User.deleteMany({ email: /test_discovery_.*@example\.com/ });
    console.log("\nAll Traveler Discovery system tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
