import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Trip from "../modules/trip/trip.model.js";
import { findMatchesService } from "../modules/match/match.service.js";
import connectDB from "../config/db.js";

const assertEqual = (actual, expected, testName) => {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    process.exit(1);
  }
};

const assertInRange = (val, min, max, testName) => {
  if (val >= min && val <= max) {
    console.log(`[PASS] ${testName} (${val} is between ${min} and ${max})`);
  } else {
    console.error(`[FAIL] ${testName}: Expected value to be between ${min} and ${max} but got ${val}`);
    process.exit(1);
  }
};

const runTests = async () => {
  try {
    console.log("Connecting to database for traveler matching algorithm tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test data
    await User.deleteMany({ email: /test_match_.*@example\.com/ });
    await Trip.deleteMany({ title: "Test Matching Trip" });

    // 1. Create current user
    const currentUser = await User.create({
      name: "Current User",
      email: "test_match_current@example.com",
      password: "password123",
      interests: ["hiking", "music", "books"],
      travelStyle: "Backpacking",
      personality: "Introvert",
      destinationPreference: "Goa",
      budgetPreference: 5000,
      preferredTripCategories: ["Adventure", "Beach"],
      visitedPlaces: ["Delhi", "Mumbai"],
      completedTrips: 2,
      trustScore: 8,
      averageRating: 4.8,
      profileCompletion: 80,
    });

    // 2. Create active trip for matching
    const currentTrip = await Trip.create({
      title: "Test Matching Trip",
      destination: "Goa",
      budget: 5000,
      travelStyle: "Backpacking",
      tags: ["Adventure", "Beach"],
      createdBy: currentUser._id,
      date: new Date(),
    });

    console.log("Mock Current User and Target Trip created successfully.\n");

    // 3. Create mock candidates
    // Candidate 1: Highly compatible (expected score > 90)
    const candPerfect = await User.create({
      name: "Perfect Match Candidate",
      email: "test_match_perfect@example.com",
      password: "password123",
      interests: ["hiking", "music", "books"],
      travelStyle: "Backpacking",
      personality: "Introvert",
      destinationPreference: "Goa",
      budgetPreference: 5000,
      preferredTripCategories: ["Adventure", "Beach"],
      visitedPlaces: ["Delhi", "Mumbai"],
      completedTrips: 2,
      trustScore: 9,
      averageRating: 4.9,
      profileCompletion: 90,
    });

    // Candidate 2: Moderately compatible (expected score ~50-70)
    const candModerate = await User.create({
      name: "Moderate Match Candidate",
      email: "test_match_moderate@example.com",
      password: "password123",
      interests: ["hiking"], // 1 common interest
      travelStyle: "Luxury", // Mismatch
      personality: "Extrovert", // Complementary match (8 pts)
      destinationPreference: "Goa", // Match (25 pts)
      budgetPreference: 10000, // Budget variance
      preferredTripCategories: ["Leisure"], // Mismatch
      visitedPlaces: ["Delhi"], // 1 common visited place
      completedTrips: 5,
      trustScore: 7,
      averageRating: 4.5,
      profileCompletion: 70,
    });

    // Candidate 3: Poorly compatible (expected score < 20, should be filtered out)
    const candPoor = await User.create({
      name: "Poor Match Candidate",
      email: "test_match_poor@example.com",
      password: "password123",
      interests: ["cooking"], // 0 common
      travelStyle: "Luxury", // Mismatch
      personality: "Ambivert", // Neutral match
      destinationPreference: "Paris", // Mismatch
      budgetPreference: 50000, // Mismatch
      preferredTripCategories: ["Business"], // Mismatch
      visitedPlaces: ["London"], // Mismatch
      completedTrips: 0,
      trustScore: 2,
      averageRating: 3.0,
      profileCompletion: 30,
    });

    console.log("Mock Candidates created successfully.\n");

    // ==========================================
    // TEST 1: Calculate Weighted Matching Scores
    // ==========================================
    console.log("--- TEST 1: Score Calculations ---");
    const result = await findMatchesService(currentTrip._id, currentUser._id, 1, 10);
    const matches = result.matches;

    console.log(`Found matches count: ${matches.length}`);

    // Verify candPoor is filtered out (since score < 20)
    const poorIndex = matches.findIndex(m => m.user._id.toString() === candPoor._id.toString());
    assertEqual(poorIndex, -1, "Poor match candidate is filtered out under score 20 threshold");

    // Retrieve candPerfect matching metrics
    const matchPerfect = matches.find(m => m.user._id.toString() === candPerfect._id.toString());
    assertEqual(!!matchPerfect, true, "Perfect candidate is found");
    assertInRange(matchPerfect.score, 90, 100, "Perfect candidate compatibility score is in range 90-100");

    // Retrieve candModerate matching metrics
    const matchModerate = matches.find(m => m.user._id.toString() === candModerate._id.toString());
    assertEqual(!!matchModerate, true, "Moderate candidate is found");
    assertInRange(matchModerate.score, 40, 70, "Moderate candidate compatibility score is in range 40-70");

    // ==========================================
    // TEST 2: Sort order & pagination
    // ==========================================
    console.log("\n--- TEST 2: Sorting Hierarchy & Pagination ---");
    // Since Perfect match score > Moderate match score, Perfect should be first in the array
    assertEqual(matches[0].user._id.toString(), candPerfect._id.toString(), "Highest score candidate ranked first");
    assertEqual(result.total, 2, "Total results count is exactly 2 matches");
    assertEqual(result.page, 1, "Returned page parameter is correct");

    // Clean up
    await User.deleteMany({ email: /test_match_.*@example\.com/ });
    await Trip.deleteMany({ title: "Test Matching Trip" });
    console.log("\nMock users and test trips cleaned up successfully.");

    console.log("\nAll Traveler Matching Engine verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
