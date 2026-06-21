import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Notification from "../modules/notification/notification.model.js";
import { followUserService, unfollowUserService } from "../modules/profile/profile.service.js";
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
    console.log("Connecting to database for follow system tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up any old test users
    await User.deleteMany({ email: /test_follow_.*@example\.com/ });
    await Notification.deleteMany({ message: /started following you/ });

    // Create mock users A, B
    const userA = await User.create({
      name: "User A",
      email: "test_follow_a@example.com",
      password: "password123",
    });

    const userB = await User.create({
      name: "User B",
      email: "test_follow_b@example.com",
      password: "password123",
    });

    console.log("Mock users created successfully.");

    // TEST 1: Prevent self-follow
    await assertThrows(
      () => followUserService(userA._id, userA._id),
      "cannot follow yourself",
      "User A cannot follow User A"
    );

    // TEST 2: Successful Follow User A -> User B
    const followResult = await followUserService(userA._id, userB._id);
    assertEqual(followResult.success, true, "Successful follow returns success true");

    // Verify DB update counts
    const updatedA = await User.findById(userA._id);
    const updatedB = await User.findById(userB._id);

    assertEqual(updatedA.following.length, 1, "User A is following 1 user");
    assertEqual(updatedA.following[0].toString(), userB._id.toString(), "User A follows User B");
    assertEqual(updatedB.followers.length, 1, "User B has 1 follower");
    assertEqual(updatedB.followers[0].toString(), userA._id.toString(), "User B is followed by User A");

    // Verify Notification exists
    const notification = await Notification.findOne({ user: userB._id });
    assertEqual(!!notification, true, "Follow notification created for User B");
    assertEqual(notification.message.includes("User A started following you"), true, "Notification message matches");
    assertEqual(notification.sender.toString(), userA._id.toString(), "Notification sender populated correctly");

    // TEST 3: Prevent duplicate follow User A -> User B
    await assertThrows(
      () => followUserService(userA._id, userB._id),
      "already following",
      "User A cannot follow User B twice"
    );

    // TEST 4: Successful Unfollow User A -> User B
    const unfollowResult = await unfollowUserService(userA._id, userB._id);
    assertEqual(unfollowResult.success, true, "Successful unfollow returns success true");

    // Verify DB update counts after unfollow
    const cleanA = await User.findById(userA._id);
    const cleanB = await User.findById(userB._id);

    assertEqual(cleanA.following.length, 0, "User A is following 0 users after unfollow");
    assertEqual(cleanB.followers.length, 0, "User B has 0 followers after unfollow");

    // TEST 5: Prevent unfollowing when not following
    await assertThrows(
      () => unfollowUserService(userA._id, userB._id),
      "not following this user",
      "User A cannot unfollow User B if not following"
    );

    // Clean up
    await User.deleteMany({ email: /test_follow_.*@example\.com/ });
    await Notification.deleteMany({ message: /started following you/ });
    console.log("\nMock users and follow notifications cleaned up successfully.");

    console.log("\nAll follow system verification tests passed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
