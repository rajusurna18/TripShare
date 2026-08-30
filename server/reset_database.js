import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";

// Import all models to ensure schemas/collections are registered
import "./src/modules/auth/auth.model.js";
import "./src/modules/trip/trip.model.js";
import "./src/modules/messages/message.model.js";
import "./src/modules/travelCommerce/travelCommerce.model.js";
import "./src/modules/activity/activity.model.js";
import "./src/modules/ai/ai.model.js";
import "./src/modules/ai/aiPacking.model.js";
import "./src/modules/ai/aiPayment.model.js";
import "./src/modules/ai/aiSubscription.model.js";
import "./src/modules/ai/aiUsage.model.js";
import "./src/modules/blog/blog.model.js";
import "./src/modules/blog/blogComment.model.js";
import "./src/modules/blog/blogLike.model.js";
import "./src/modules/blog/blogSave.model.js";
import "./src/modules/blog/blogShare.model.js";
import "./src/modules/blog/blogView.model.js";
import "./src/modules/contact/contact.model.js";
import "./src/modules/expense/expense.model.js";
import "./src/modules/expense/settlement.model.js";
import "./src/modules/friend/friend.model.js";
import "./src/modules/joinRequest/joinRequest.model.js";
import "./src/modules/memory/memory.model.js";
import "./src/modules/memory/memoryComment.model.js";
import "./src/modules/notification/notification.model.js";
import "./src/modules/review/review.model.js";
import "./src/modules/timeline/timelineEvent.model.js";
import "./src/modules/tripSave/tripSave.model.js";
import "./src/modules/tripSave/tripShare.model.js";

async function runResetDatabase() {
  console.log("==========================================");
  console.log("TRIPSHARE MONGODB DATABASE RESET SCRIPT");
  console.log("==========================================");

  await connectDB();

  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  console.log(`Connected Database Name: [ ${dbName} ]`);

  // List actual collections in database
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  console.log("\nExisting Collections & Current Document Counts:");
  console.log("------------------------------------------");
  
  const stats = [];
  for (const name of collectionNames) {
    const count = await db.collection(name).countDocuments();
    stats.push({ collection: name, count });
    console.log(` - ${name.padEnd(25)} : ${count} documents`);
  }

  const isConfirmed = process.env.RESET_TRIPSHARE_DB === "true";

  if (!isConfirmed) {
    console.log("\n------------------------------------------");
    console.log("⚠️ DRY-RUN MODE ONLY — NO DATA WAS DELETED.");
    console.log("To execute the destructive data reset, run with:");
    console.log("  $env:RESET_TRIPSHARE_DB=\"true\"; node reset_database.js");
    console.log("==========================================");
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log("\n------------------------------------------");
  console.log("🚀 CONFIRMATION FLAG DETECTED: EXECUTING RESET...");
  console.log("------------------------------------------");

  const deletionResults = [];
  for (const { collection: name, count: beforeCount } of stats) {
    const deleteRes = await db.collection(name).deleteMany({});
    const afterCount = await db.collection(name).countDocuments();
    deletionResults.push({
      collection: name,
      deleted: deleteRes.deletedCount,
      remaining: afterCount,
    });
    console.log(` ✅ Cleared [ ${name} ]: Deleted ${deleteRes.deletedCount} documents (Remaining: ${afterCount})`);
  }

  console.log("\n==========================================");
  console.log("FINAL VERIFICATION OF DELETED DATA:");
  console.log("==========================================");
  for (const res of deletionResults) {
    console.log(` - ${res.collection.padEnd(25)}: ${res.remaining} documents remaining`);
  }
  console.log("==========================================");
  console.log("DATABASE RESET COMPLETED SUCCESSFULLY.");
  console.log("==========================================");

  await mongoose.connection.close();
  process.exit(0);
}

runResetDatabase().catch((err) => {
  console.error("Database reset error:", err);
  process.exit(1);
});
