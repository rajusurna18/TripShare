import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Trip from "../modules/trip/trip.model.js";
import Memory from "../modules/memory/memory.model.js";
import MemoryComment from "../modules/memory/memoryComment.model.js";
import Activity from "../modules/activity/activity.model.js";
import Notification from "../modules/notification/notification.model.js";
import { deleteTripService } from "../modules/trip/trip.service.js";
import { createMemoryService } from "../modules/memory/memory.service.js";
import { createCommentService, createReplyService } from "../modules/memory/memory.service.js";
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
    console.log("Connecting to database for trip cascade verification...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test data
    await User.deleteMany({ email: /test_cascade_.*@example\.com/ });
    const user = await User.create({
      name: "Cascade Tester",
      email: "test_cascade_user@example.com",
      password: "password123",
    });

    // 1. Create Trip
    const trip = await Trip.create({
      title: "Cascade Trip",
      destination: "Cairo, Egypt",
      startDate: new Date(),
      endDate: new Date(),
      date: new Date(),
      budget: 1200,
      createdBy: user._id,
      members: [user._id],
    });

    // 2. Create Memory (triggers ACTIVITY_UPLOADED)
    const memory = await createMemoryService({
      trip: trip._id,
      user: user._id,
      image: "uploads/pyramids.jpg",
      caption: "Sphinx & Pyramids",
    });

    // 3. Create Comment
    const comment = await createCommentService(memory._id, user._id, "Unbelievable Pyramids!");

    // 4. Create Reply
    const reply = await createReplyService(memory._id, user._id, comment._id, "Agreed!");

    // Create a mock Notification to make sure it gets cleaned up
    const notification = await Notification.create({
      user: user._id,
      message: "Mock notification for memory",
      type: "MEMORY_LIKED",
      link: `/memories/${trip._id}`,
      category: "MEMORY",
      sender: user._id,
    });

    console.log("--- BEFORE DELETION COUNTS ---");
    const tripBefore = await Trip.countDocuments({ _id: trip._id });
    const memoryBefore = await Memory.countDocuments({ _id: memory._id });
    const commentsBefore = await MemoryComment.countDocuments({ memory: memory._id });
    const activitiesBefore = await Activity.countDocuments({ tripId: trip._id });
    const notificationsBefore = await Notification.countDocuments({ link: { $regex: trip._id } });

    console.log(`Trips: ${tripBefore}`);
    console.log(`Memories: ${memoryBefore}`);
    console.log(`Comments & Replies: ${commentsBefore}`);
    console.log(`Activities: ${activitiesBefore}`);
    console.log(`Notifications: ${notificationsBefore}`);

    assertEqual(tripBefore, 1, "Trip exists");
    assertEqual(memoryBefore, 1, "Memory exists");
    assertEqual(commentsBefore, 2, "Root Comment and Reply exist");
    assertEqual(activitiesBefore, 1, "Activity created");
    assertEqual(notificationsBefore > 0, true, "Notifications created");

    console.log("\nDeleting Trip cascading comments, replies, activities, notifications...");
    await deleteTripService(trip._id.toString(), user._id.toString());

    console.log("\n--- AFTER DELETION COUNTS ---");
    const tripAfter = await Trip.countDocuments({ _id: trip._id });
    const memoryAfter = await Memory.countDocuments({ _id: memory._id });
    const commentsAfter = await MemoryComment.countDocuments({ memory: memory._id });
    const activitiesAfter = await Activity.countDocuments({ tripId: trip._id });
    const notificationsAfter = await Notification.countDocuments({ link: { $regex: trip._id } });

    console.log(`Trips: ${tripAfter}`);
    console.log(`Memories: ${memoryAfter}`);
    console.log(`Comments & Replies: ${commentsAfter}`);
    console.log(`Activities: ${activitiesAfter}`);
    console.log(`Notifications: ${notificationsAfter}`);

    assertEqual(tripAfter, 0, "Trip deleted");
    assertEqual(memoryAfter, 0, "Memory deleted");
    assertEqual(commentsAfter, 0, "Memory comments and replies deleted cascadingly");
    assertEqual(activitiesAfter, 0, "Activities deleted cascadingly");
    assertEqual(notificationsAfter, 0, "Notifications deleted cascadingly");

    // Clean up user
    await User.deleteMany({ email: /test_cascade_.*@example\.com/ });

    console.log("\nAll cascade delete verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
