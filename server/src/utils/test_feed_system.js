import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Trip from "../modules/trip/trip.model.js";
import Memory from "../modules/memory/memory.model.js";
import Review from "../modules/review/review.model.js";
import Activity from "../modules/activity/activity.model.js";
import { createTripService, deleteTripService } from "../modules/trip/trip.service.js";
import { sendJoinRequestService, acceptJoinRequestService } from "../modules/joinRequest/joinRequest.service.js";
import { createMemoryService } from "../modules/memory/memory.service.js";
import { createReviewService } from "../modules/review/review.service.js";
import { getFeedService } from "../modules/activity/activity.service.js";
import connectDB from "../config/db.js";

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
    console.log("Connecting to database for feed system tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test data
    await User.deleteMany({ email: /test_feed_.*@example\.com/ });
    const userA = await User.create({
      name: "User A",
      email: "test_feed_a@example.com",
      password: "password123",
    });
    const userB = await User.create({
      name: "User B",
      email: "test_feed_b@example.com",
      password: "password123",
      following: [userA._id] // User B follows User A
    });

    await Activity.deleteMany({ actor: { $in: [userA._id, userB._id] } });

    console.log("Mock users created successfully.\n");

    // ==========================================
    // TEST 1: Trip Created Trigger
    // ==========================================
    console.log("--- TEST 1: Trip Creation Trigger ---");
    const tripData = {
      title: "Euro Expedition",
      destination: "Paris, France",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-15"),
      date: new Date("2026-07-01"),
      budget: 1500,
    };
    const trip = await createTripService(tripData, userA._id.toString());
    
    // Check if activity was written
    const actCreated = await Activity.findOne({ actor: userA._id, type: "TRIP_CREATED" });
    assertEqual(!!actCreated, true, "Trip creation triggers TRIP_CREATED activity logging");
    assertEqual(actCreated.entityType, "Trip", "EntityType is set to Trip");
    assertEqual(actCreated.metadata.get("destination"), "Paris, France", "Metadata destination is snapshotted");
    assertEqual(actCreated.metadata.get("title"), "Euro Expedition", "Metadata title is snapshotted");

    // ==========================================
    // TEST 2: Trip Joined Trigger
    // ==========================================
    console.log("\n--- TEST 2: Trip Joined Trigger ---");
    const joinReq = await sendJoinRequestService(trip._id, userB._id);
    await acceptJoinRequestService(joinReq._id, userA._id);

    const actJoined = await Activity.findOne({ actor: userB._id, type: "TRIP_JOINED" });
    assertEqual(!!actJoined, true, "Accepting join request triggers TRIP_JOINED activity logging");
    assertEqual(actJoined.tripId.toString(), trip._id.toString(), "Trip ID references the joined trip context");

    // ==========================================
    // TEST 3: Memory Uploaded Trigger
    // ==========================================
    console.log("\n--- TEST 3: Memory Upload Trigger ---");
    const memory = await createMemoryService({
      trip: trip._id,
      user: userA._id,
      image: "uploads/test.jpg",
      caption: "Beautiful Louvre!"
    });

    const actMemory = await Activity.findOne({ actor: userA._id, type: "MEMORY_UPLOADED" });
    assertEqual(!!actMemory, true, "Memory creation triggers MEMORY_UPLOADED activity logging");
    assertEqual(actMemory.metadata.get("caption"), "Beautiful Louvre!", "Memory caption snapshot is correct");

    // ==========================================
    // TEST 4: Review Added Trigger
    // ==========================================
    console.log("\n--- TEST 4: Review Added Trigger ---");
    const review = await createReviewService({
      reviewer: userB._id,
      reviewFor: userA._id,
      trip: trip._id,
      rating: 5,
      comment: "A great companion!"
    });

    const actReview = await Activity.findOne({ actor: userB._id, type: "REVIEW_ADDED" });
    assertEqual(!!actReview, true, "Review creation triggers REVIEW_ADDED activity logging");
    assertEqual(actReview.metadata.get("reviewedUserName"), "User A", "Metadata Reviewed user name is correct");

    // ==========================================
    // TEST 5: Feed Retrieval Logic & Pagination
    // ==========================================
    console.log("\n--- TEST 5: Feed Queries & Pagination ---");
    // Feed Types: home, dashboard, user
    const homeFeed = await getFeedService(userB._id, { feedType: "home", page: 1, limit: 10 });
    // Total should contain TRIP_CREATED (User A), TRIP_JOINED (User B), MEMORY_UPLOADED (User A), REVIEW_ADDED (User B).
    // All are PUBLIC, so they should be present.
    assertEqual(homeFeed.totalResults >= 4, true, "Home feed returns public activities");

    const dashFeed = await getFeedService(userB._id, { feedType: "dashboard", page: 1, limit: 2 });
    assertEqual(dashFeed.activities.length, 2, "Dashboard feed supports pagination page size limit");
    assertEqual(dashFeed.totalPages >= 2, true, "Total pages counts correctly");

    const userFeed = await getFeedService(userB._id, { feedType: "user", page: 1, limit: 10, targetUserId: userA._id });
    const allUserA = userFeed.activities.every(act => act.actor._id.toString() === userA._id.toString());
    assertEqual(allUserA, true, "User feed returns activities scoped strictly to the target user");

    // ==========================================
    // TEST 6: Cascade Deletion
    // ==========================================
    console.log("\n--- TEST 6: Cascade Deletion ---");
    await deleteTripService(trip._id.toString(), userA._id.toString());
    
    // Deleting the trip should clean up any activities linked to it (TRIP_CREATED, TRIP_JOINED, MEMORY_UPLOADED)
    const remainingTripActivities = await Activity.find({ tripId: trip._id });
    assertEqual(remainingTripActivities.length, 0, "Activities associated with the trip are cascadingly deleted");

    // Clean up test data
    await User.deleteMany({ email: /test_feed_.*@example\.com/ });
    await Activity.deleteMany({ actor: { $in: [userA._id, userB._id] } });
    await Memory.deleteMany({ user: userA._id });
    await Review.deleteMany({ reviewer: userB._id });

    console.log("\nMock users and activities cleaned up successfully.");
    console.log("\nAll activity feed system verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
