import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Notification from "../modules/notification/notification.model.js";
import {
  createNotificationService,
  getNotificationsService,
  markAllReadService,
  deleteNotificationService,
} from "../modules/notification/notification.service.js";
import connectDB from "../config/db.js";

const assertEqual = (actual, expected, testName) => {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    process.exit(1);
  }
};

const assertThrows = async (fn, expectedMsg, testName) => {
  try {
    await fn();
    console.error(`[FAIL] ${testName}: Expected to throw but completed successfully`);
    process.exit(1);
  } catch (err) {
    if (err.message.includes(expectedMsg)) {
      console.log(`[PASS] ${testName} (threw expected error: "${err.message}")`);
    } else {
      console.error(`[FAIL] ${testName}: Expected error including "${expectedMsg}" but got "${err.message}"`);
      process.exit(1);
    }
  }
};

const runTests = async () => {
  try {
    console.log("Connecting to database for notification system tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test data
    await User.deleteMany({ email: /test_notify_.*@example\.com/ });
    const userA = await User.create({
      name: "User A",
      email: "test_notify_a@example.com",
      password: "password123",
    });
    const userB = await User.create({
      name: "User B",
      email: "test_notify_b@example.com",
      password: "password123",
    });

    await Notification.deleteMany({ user: { $in: [userA._id, userB._id] } });

    console.log("Mock users created successfully.\n");

    // ==========================================
    // TEST 1: Category Mapping on Creation
    // ==========================================
    console.log("--- TEST 1: Category Mapping ---");
    const n1 = await createNotificationService(userA._id, "Friend request sent", "friend", "/friends", userB._id);
    assertEqual(n1.category, "FRIEND", "friend type maps to FRIEND category");

    const n2 = await createNotificationService(userA._id, "Trip joined request", "join_request", "/trip/1", userB._id);
    assertEqual(n2.category, "TRIP", "join_request type maps to TRIP category");

    const n3 = await createNotificationService(userA._id, "Memory liked", "memory", "", userB._id);
    assertEqual(n3.category, "MEMORY", "memory type maps to MEMORY category");

    const n4 = await createNotificationService(userA._id, "Review received", "review", "/reviews", userB._id);
    assertEqual(n4.category, "REVIEW", "review type maps to REVIEW category");

    const n5 = await createNotificationService(userA._id, "Chat message received", "message", "/chat/1", userB._id);
    assertEqual(n5.category, "CHAT", "message type maps to CHAT category");

    const n6 = await createNotificationService(userA._id, "System message", "general", "", null);
    assertEqual(n6.category, "SYSTEM", "general type maps to SYSTEM category");

    // ==========================================
    // TEST 2: Pagination and Category Filters
    // ==========================================
    console.log("\n--- TEST 2: Pagination & Category Filters ---");
    // Create more test notifications for User A to check pagination limit
    // We already have 6 notifications for User A. Let's add 6 more under FRIEND category to hit total 12.
    for (let i = 0; i < 6; i++) {
      await createNotificationService(userA._id, `Friend request ${i}`, "friend", "", userB._id);
    }

    // Total should be 12. Let's fetch with limit=5
    const resPage1 = await getNotificationsService(userA._id, { page: 1, limit: 5 });
    assertEqual(resPage1.notifications.length, 5, "Page 1 limit returns exactly 5 items");
    assertEqual(resPage1.totalResults, 12, "Total results matches count of 12");
    assertEqual(resPage1.totalPages, 3, "Total pages calculation matches (12 / 5 rounded up = 3)");
    assertEqual(resPage1.hasNextPage, true, "Page 1 has a next page");
    assertEqual(resPage1.hasPreviousPage, false, "Page 1 does not have a previous page");

    const resPage3 = await getNotificationsService(userA._id, { page: 3, limit: 5 });
    assertEqual(resPage3.notifications.length, 2, "Page 3 has the remaining 2 items");
    assertEqual(resPage3.hasNextPage, false, "Page 3 does not have a next page");
    assertEqual(resPage3.hasPreviousPage, true, "Page 3 has a previous page");

    // Fetch with FRIEND category filter (1 n1 + 6 looped = 7 total)
    const resFriendFilter = await getNotificationsService(userA._id, { page: 1, limit: 10, category: "FRIEND" });
    assertEqual(resFriendFilter.totalResults, 7, "Category filter returns only FRIEND notifications");
    assertEqual(resFriendFilter.notifications.every(n => n.category === "FRIEND"), true, "All items in category filter result are indeed FRIEND");

    // ==========================================
    // TEST 3: Bulk Mark All As Read
    // ==========================================
    console.log("\n--- TEST 3: Mark All Read ---");
    const unreadCountBefore = await Notification.countDocuments({ user: userA._id, read: false });
    assertEqual(unreadCountBefore, 12, "All 12 notifications are initially unread");

    await markAllReadService(userA._id);
    const unreadCountAfter = await Notification.countDocuments({ user: userA._id, read: false });
    assertEqual(unreadCountAfter, 0, "All notifications are marked as read");

    // ==========================================
    // TEST 4: Delete Single Notification & Ownership
    // ==========================================
    console.log("\n--- TEST 4: Delete & Ownership Authorization ---");
    // Create new notification for User A
    const nDeleteTest = await createNotificationService(userA._id, "Will delete this", "general");

    // User B tries to delete User A's notification - should fail
    await assertThrows(
      () => deleteNotificationService(nDeleteTest._id, userB._id),
      "Not authorized to delete this notification",
      "User B is unauthorized to delete User A's notification"
    );

    // User A deletes their own notification - should succeed
    const deleteRes = await deleteNotificationService(nDeleteTest._id, userA._id);
    assertEqual(deleteRes.deletedCount, 1, "Deleted count is 1 for successful deletion");

    const findDeleted = await Notification.findById(nDeleteTest._id);
    assertEqual(findDeleted, null, "Deleted notification no longer exists in database");

    // Clean up
    await User.deleteMany({ email: /test_notify_.*@example\.com/ });
    await Notification.deleteMany({ user: { $in: [userA._id, userB._id] } });
    console.log("\nMock users and test notifications cleaned up successfully.");

    console.log("\nAll notification system verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
