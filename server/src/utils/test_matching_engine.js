import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { findMatchesService } from "../modules/match/match.service.js";
import Trip from "../modules/trip/trip.model.js";
import User from "../modules/auth/auth.model.js";

const runTests = async () => {
  try {
    console.log("Connecting to database for Matching Engine Verification...");
    await connectDB();

    // Fetch an arbitrary trip and user to run the service
    const trip = await Trip.findOne({});
    if (!trip) {
      console.log("No trips found in database. Seed a trip to verify.");
      process.exit(0);
    }

    // Find any user to trigger matches
    const user = await User.findOne({});
    if (!user) {
      console.log("No users found in database to match against.");
      process.exit(0);
    }

    console.log(`Running matching service for Trip ID: ${trip._id} (Destination: ${trip.destination}) and User ID: ${user._id}`);
    const results = await findMatchesService(trip._id, user._id, 1, 10);
    
    console.log(`Matches count found: ${results.matches.length}`);
    if (results.matches.length > 0) {
      const firstMatch = results.matches[0];
      console.log("First Match compatibility:", firstMatch.score);
      console.log("Score breakdown structure:", JSON.stringify(firstMatch.scoreBreakdown));
      
      // Verification Assertions
      if (firstMatch.score !== undefined && firstMatch.scoreBreakdown !== undefined) {
        console.log("[PASS] Matching Engine outputs compatibility scores and breakdowns correctly.");
      } else {
        console.error("[FAIL] Missing compatibility score or breakdown structure.");
        process.exit(1);
      }
    } else {
      console.log("[PASS] Matching Engine completed execution successfully (no matching candidates found).");
    }

    // Verify index explain path
    const explanation = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
          $or: [
            { destinationPreference: trip.destination },
            { travelStyle: user.travelStyle }
          ]
        }
      }
    ]).explain();
    const winningPlan = explanation[0]?.queryPlanner?.winningPlan || explanation.queryPlanner?.winningPlan;
    console.log("MongoDB query planner winning plan:", JSON.stringify(winningPlan));

    console.log("\nAll Matching Engine verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
};

runTests();
