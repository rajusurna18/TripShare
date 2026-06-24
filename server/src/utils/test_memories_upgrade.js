import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import Trip from "../modules/trip/trip.model.js";
import Memory from "../modules/memory/memory.model.js";
import MemoryComment from "../modules/memory/memoryComment.model.js";
import Notification from "../modules/notification/notification.model.js";
import {
  likeMemoryService,
  createCommentService,
  createReplyService,
  getMemoryCommentsService,
  deleteCommentService,
} from "../modules/memory/memory.service.js";
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
    console.log("Connecting to database for memories upgrade tests...");
    await connectDB();
    console.log("Database connected successfully.\n");

    // Clean up old test data
    await User.deleteMany({ email: /test_mem_.*@example\.com/ });
    const userA = await User.create({
      name: "Memory Owner",
      email: "test_mem_owner@example.com",
      password: "password123",
    });
    const userB = await User.create({
      name: "Commenter Liker",
      email: "test_mem_userb@example.com",
      password: "password123",
    });

    const trip = await Trip.create({
      title: "Memory Test Trip",
      destination: "Rome, Italy",
      startDate: new Date(),
      endDate: new Date(),
      date: new Date(),
      budget: 1000,
      createdBy: userA._id,
      members: [userA._id, userB._id],
    });

    const memory = await Memory.create({
      trip: trip._id,
      user: userA._id,
      image: "uploads/rome.jpg",
      caption: "When in Rome!",
    });

    await Notification.deleteMany({ user: { $in: [userA._id, userB._id] } });

    console.log("Mock data initialized: Users, Trip, and Memory generated.\n");

    // ==========================================
    // TEST 1: Like / Unlike Toggling and Counter
    // ==========================================
    console.log("--- TEST 1: Like Toggling & Counter Cache ---");
    // User B likes memory
    await likeMemoryService(memory._id, userB._id);
    let updatedMemory = await Memory.findById(memory._id);
    assertEqual(updatedMemory.likesCount, 1, "Likes count increments to 1");
    assertEqual(updatedMemory.likes.includes(userB._id), true, "User B is in likes array");

    // Verify Notification sent to memory owner User A
    const likeNotif = await Notification.findOne({ user: userA._id, type: "MEMORY_LIKED" });
    assertEqual(!!likeNotif, true, "MEMORY_LIKED notification generated");
    assertEqual(likeNotif.sender.toString(), userB._id.toString(), "Sender is User B");

    // User B unlikes memory
    await likeMemoryService(memory._id, userB._id);
    updatedMemory = await Memory.findById(memory._id);
    assertEqual(updatedMemory.likesCount, 0, "Likes count decrements to 0");

    // ==========================================
    // TEST 2: Create Root Comment
    // ==========================================
    console.log("\n--- TEST 2: Create Root Comment & Counter Cache ---");
    const commentText = "Spectacular view!";
    const rootComment = await createCommentService(memory._id, userB._id, commentText);

    updatedMemory = await Memory.findById(memory._id);
    assertEqual(updatedMemory.commentsCount, 1, "Comments count increments to 1");
    assertEqual(rootComment.text, commentText, "Root comment text matches");
    assertEqual(rootComment.parentComment, null, "Parent comment is null (root)");

    // Verify Notification sent to memory owner User A
    const commentNotif = await Notification.findOne({ user: userA._id, type: "MEMORY_COMMENTED" });
    assertEqual(!!commentNotif, true, "MEMORY_COMMENTED notification generated");
    assertEqual(commentNotif.sender.toString(), userB._id.toString(), "Sender is User B");

    // ==========================================
    // TEST 3: Create Nested Reply
    // ==========================================
    console.log("\n--- TEST 3: Create Reply ---");
    const replyText = "Indeed it is!";
    // User A replies to User B's comment
    const replyComment = await createReplyService(memory._id, userA._id, rootComment._id, replyText);

    updatedMemory = await Memory.findById(memory._id);
    assertEqual(updatedMemory.commentsCount, 2, "Comments count increments to 2");
    assertEqual(replyComment.text, replyText, "Reply comment text matches");
    assertEqual(replyComment.parentComment.toString(), rootComment._id.toString(), "Parent comment references root");

    // Verify Notification sent to comment owner User B
    const replyNotif = await Notification.findOne({ user: userB._id, type: "MEMORY_REPLIED" });
    assertEqual(!!replyNotif, true, "MEMORY_REPLIED notification generated");
    assertEqual(replyNotif.sender.toString(), userA._id.toString(), "Sender is User A");

    // ==========================================
    // TEST 4: Enforce Reply Depth Limit = 1
    // ==========================================
    console.log("\n--- TEST 4: Enforce Reply Depth Limit = 1 ---");
    try {
      await createReplyService(memory._id, userB._id, replyComment._id, "Can I reply to this reply?");
      console.error("[FAIL] Enforce Depth Limit: Allowed nested reply of depth 2");
      process.exit(1);
    } catch (err) {
      console.log(`[PASS] Enforce Depth Limit: Blocked depth 2 reply with message: "${err.message}"`);
    }

    // ==========================================
    // TEST 5: Get Comments Stream with Replies
    // ==========================================
    console.log("\n--- TEST 5: Comments Stream Query (Nesting & Index checks) ---");
    const feed = await getMemoryCommentsService(memory._id, 1, 10);
    assertEqual(feed.totalResults, 1, "One root comment found in query results");
    assertEqual(feed.comments[0].replies.length, 1, "Root comment contains populated nested reply");
    assertEqual(feed.comments[0].replies[0].text, replyText, "Reply text is populated correctly");

    // ==========================================
    // TEST 6: Cascade Deletion
    // ==========================================
    console.log("\n--- TEST 6: Cascade Deletion ---");
    // Delete root comment. Should delete root comment and the reply, decrementing commentsCount by 2.
    const delResult = await deleteCommentService(rootComment._id, userB._id);
    assertEqual(delResult.deletedCount, 2, "Cascade deletion deletes root comment and its replies");

    updatedMemory = await Memory.findById(memory._id);
    assertEqual(updatedMemory.commentsCount, 0, "Memory commentsCount decremented back to 0");

    const repliesCheck = await MemoryComment.find({ parentComment: rootComment._id });
    assertEqual(repliesCheck.length, 0, "No orphaned replies remain in database");

    // Clean up test data
    await User.deleteMany({ email: /test_mem_.*@example\.com/ });
    await Trip.deleteOne({ _id: trip._id });
    await Memory.deleteOne({ _id: memory._id });
    await Notification.deleteMany({ user: { $in: [userA._id, userB._id] } });

    console.log("\nDatabase test cleanups complete.");
    console.log("\nAll Phase 10 Memory Upgrade system verification tests passed! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
};

runTests();
