import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/modules/auth/auth.model.js";
import Trip from "./src/modules/trip/trip.model.js";
import TripSave from "./src/modules/tripSave/tripSave.model.js";
import TripShare from "./src/modules/tripSave/tripShare.model.js";
import {
  saveTripService,
  unsaveTripService,
  getSavedTripsService,
  shareTripService,
  getShareAnalyticsService,
} from "./src/modules/tripSave/tripSave.service.js";

dotenv.config();

const runTests = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    console.log("\n--- Cleaning up previous test data if any ---");
    const testEmailA = "testuser_a_save@example.com";
    const testEmailB = "testuser_b_save@example.com";
    
    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    
    console.log("Creating test users...");
    const userA = await User.create({
      name: "Test User A",
      email: testEmailA,
      password: "TestPassword123!",
    });
    
    const userB = await User.create({
      name: "Test User B",
      email: testEmailB,
      password: "TestPassword123!",
    });

    console.log(`Created User A: ${userA._id} and User B: ${userB._id}`);

    console.log("\nCreating a test trip hosted by User B...");
    const trip = await Trip.create({
      title: "Paris Getaway",
      destination: "Paris, France",
      date: new Date(),
      budget: 150000,
      createdBy: userB._id,
      members: [userB._id],
    });
    console.log(`Created Trip: ${trip._id} (Host: User B)`);

    console.log("\n[TEST 1] Owner Validation - User B (owner) tries to save their own trip...");
    try {
      await saveTripService(trip._id.toString(), userB._id.toString());
      console.error("❌ Test 1 Failed: User B was able to save their own trip.");
      process.exit(1);
    } catch (error) {
      console.log(`✅ Test 1 Passed: Correctly blocked owner from saving own trip. Error: "${error.message}"`);
    }

    console.log("\n[TEST 2] Save Trip - User A saves User B's trip...");
    const save1 = await saveTripService(trip._id.toString(), userA._id.toString());
    console.log(`Saved Record ID: ${save1._id}`);
    
    const updatedTrip1 = await Trip.findById(trip._id);
    console.log(`Trip savesCount: ${updatedTrip1.savesCount}`);
    if (updatedTrip1.savesCount === 1) {
      console.log("✅ Test 2 Passed: savesCount incremented to 1.");
    } else {
      console.error(`❌ Test 2 Failed: savesCount is ${updatedTrip1.savesCount}, expected 1.`);
      process.exit(1);
    }

    console.log("\n[TEST 3] Duplicate Save Prevention - User A tries to save again...");
    // The service handles duplicate save idempotently (returns existing save rather than failing/creating another)
    const save2 = await saveTripService(trip._id.toString(), userA._id.toString());
    const updatedTrip2 = await Trip.findById(trip._id);
    console.log(`Trip savesCount: ${updatedTrip2.savesCount}`);
    const savesList = await TripSave.find({ user: userA._id, trip: trip._id });
    
    if (savesList.length === 1 && updatedTrip2.savesCount === 1) {
      console.log("✅ Test 3 Passed: Idempotent save succeeded, duplicates prevented, savesCount is still 1.");
    } else {
      console.error(`❌ Test 3 Failed: savesCount is ${updatedTrip2.savesCount}, saved count in db is ${savesList.length}`);
      process.exit(1);
    }

    console.log("\n[TEST 4] Get Saved Trips - Retrieval filter...");
    const result = await getSavedTripsService(userA._id.toString(), {
      search: "Paris",
    });
    console.log(`Found saves count: ${result.saves.length}`);
    if (result.saves.length === 1 && result.saves[0].trip.title === "Paris Getaway") {
      console.log("✅ Test 4 Passed: Saved trip retrieved and populated successfully.");
    } else {
      console.error("❌ Test 4 Failed to retrieve saved trip.");
      process.exit(1);
    }

    console.log("\n[TEST 5] Share Trip - Log WhatsApp share...");
    await shareTripService(trip._id.toString(), userA._id.toString(), "whatsapp", "127.0.0.1");
    const updatedTrip3 = await Trip.findById(trip._id);
    console.log(`Trip sharesCount: ${updatedTrip3.sharesCount}`);
    if (updatedTrip3.sharesCount === 1) {
      console.log("✅ Test 5 Passed: sharesCount incremented to 1.");
    } else {
      console.error(`❌ Test 5 Failed: sharesCount is ${updatedTrip3.sharesCount}, expected 1.`);
      process.exit(1);
    }

    console.log("\n[TEST 6] Share Analytics - Retrieve for Host User B...");
    const analytics = await getShareAnalyticsService(userB._id.toString());
    console.log("Analytics retrieved:", JSON.stringify(analytics, null, 2));
    if (analytics.totalShares === 1 && analytics.sharesByPlatform[0].platform === "whatsapp") {
      console.log("✅ Test 6 Passed: Share analytics grouped and aggregated properly.");
    } else {
      console.error("❌ Test 6 Failed to compute proper analytics.");
      process.exit(1);
    }

    console.log("\n[TEST 7] Unsave Trip - User A unsaves Trip...");
    await unsaveTripService(trip._id.toString(), userA._id.toString());
    const updatedTrip4 = await Trip.findById(trip._id);
    console.log(`Trip savesCount: ${updatedTrip4.savesCount}`);
    const savesListAfter = await TripSave.find({ user: userA._id, trip: trip._id });
    
    if (savesListAfter.length === 0 && updatedTrip4.savesCount === 0) {
      console.log("✅ Test 7 Passed: Trip unsaved successfully, savesCount decremented to 0.");
    } else {
      console.error(`❌ Test 7 Failed: savesCount is ${updatedTrip4.savesCount}, saved count in db is ${savesListAfter.length}`);
      process.exit(1);
    }

    console.log("\n--- Cleaning up test data ---");
    await TripSave.deleteMany({ trip: trip._id });
    await TripShare.deleteMany({ trip: trip._id });
    await Trip.deleteOne({ _id: trip._id });
    await User.deleteMany({ email: { $in: [testEmailA, testEmailB] } });
    console.log("Clean up finished!");

    console.log("\n🎉 ALL BACKEND BUSINESS LOGIC TESTS PASSED SUCCESSFULLY! 🎉\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ TEST RUN ERROR:", err);
    process.exit(1);
  }
};

runTests();
