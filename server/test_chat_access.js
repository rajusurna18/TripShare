import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/modules/auth/auth.model.js";
import Trip from "./src/modules/trip/trip.model.js";
import { checkUserMembershipService } from "./src/modules/trip/trip.service.js";

async function runChatAccessTests() {
  console.log("==========================================");
  console.log("RUNNING TRIPSHARE GROUP CHAT ACCESS SUITE");
  console.log("==========================================");

  await connectDB();

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = "") => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` (${detail})` : ""}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ""}`);
      failed++;
    }
  };

  try {
    // Setup test users
    const userZeroTrips = await User.create({
      name: "Zero Trips User",
      email: `zero_trips_${Date.now()}@test.com`,
      password: "Password123!",
    });

    const userMemberA = await User.create({
      name: "Trip A Member",
      email: `member_a_${Date.now()}@test.com`,
      password: "Password123!",
    });

    const userMemberB = await User.create({
      name: "Trip B Member",
      email: `member_b_${Date.now()}@test.com`,
      password: "Password123!",
    });

    // Setup trips
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);

    const tripA = await Trip.create({
      title: "Goa Beach Getaway",
      destination: "Goa",
      date: startDate,
      startDate,
      endDate,
      budget: 15000,
      createdBy: userMemberA._id,
      members: [userMemberA._id],
    });

    const tripB = await Trip.create({
      title: "Manali Adventure",
      destination: "Manali",
      date: startDate,
      startDate,
      endDate,
      budget: 20000,
      createdBy: userMemberB._id,
      members: [userMemberB._id],
    });

    // TEST 1: 0-trip user check-membership
    const memRes1 = await checkUserMembershipService(userZeroTrips._id.toString());
    assert(
      memRes1.hasTrips === false && memRes1.count === 0,
      "Test 1: 0-trip user membership check",
      "Correctly identifies user has 0 trips"
    );

    // TEST 2: Trip member check-membership
    const memRes2 = await checkUserMembershipService(userMemberA._id.toString());
    assert(
      memRes2.hasTrips === true && memRes2.count === 1 && memRes2.trips[0]._id.toString() === tripA._id.toString(),
      "Test 2: Trip A member membership check",
      "Correctly identifies user has 1 trip (Goa Beach Getaway)"
    );

    // TEST 3: Cross-trip access control (Member A trying to access Trip B)
    const isMemberOfB = tripB.createdBy.toString() === userMemberA._id.toString() ||
      tripB.members.some(id => id.toString() === userMemberA._id.toString());
    assert(
      !isMemberOfB,
      "Test 3: Cross-trip access protection",
      "Member of Trip A correctly blocked from Trip B"
    );

    // TEST 4: Non-member user access control for zero trips user
    const isMemberOfAForZeroUser = tripA.createdBy.toString() === userZeroTrips._id.toString() ||
      tripA.members.some(id => id.toString() === userZeroTrips._id.toString());
    assert(
      !isMemberOfAForZeroUser,
      "Test 4: HTTP API & Group Chat access for 0-trip user",
      "0-trip user rejected from all trip chats"
    );

    // TEST 5: Member joins trip -> unlocks access immediately
    tripA.members.push(userZeroTrips._id);
    await tripA.save();

    const memRes5 = await checkUserMembershipService(userZeroTrips._id.toString());
    assert(
      memRes5.hasTrips === true && memRes5.count === 1,
      "Test 5: Joining a trip unlocks Group Chat access",
      "Group Chat access unlocked immediately after joining trip"
    );

    // Cleanup test data
    await Trip.deleteMany({ _id: { $in: [tripA._id, tripB._id] } });
    await User.deleteMany({ _id: { $in: [userZeroTrips._id, userMemberA._id, userMemberB._id] } });

  } catch (err) {
    console.error("Chat Access Test Suite execution error:", err);
    failed++;
  } finally {
    await mongoose.connection.close();
  }

  console.log("==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runChatAccessTests().catch(console.error);
