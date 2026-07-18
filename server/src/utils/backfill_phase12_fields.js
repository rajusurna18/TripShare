import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import connectDB from "../config/db.js";

const runMigration = async () => {
  try {
    console.log("Connecting to database for Phase 12 backfill...");
    await connectDB();
    console.log("Database connected successfully.");

    const users = await User.find({});
    console.log(`Found ${users.length} user documents to evaluate...`);

    let updatedCount = 0;
    for (const user of users) {
      const budgetPref = user.budgetPreference || 0;
      let needsUpdate = false;
      const updateData = {};

      if (user.mbti === undefined || user.mbti === "") {
        // Set standard personality defaults if empty
        updateData.mbti = "INFJ"; // Neutral MBTI placeholder
        needsUpdate = true;
      }
      if (!user.budgetRange || (user.budgetRange.min === 0 && user.budgetRange.max === 0)) {
        updateData.budgetRange = {
          min: Math.max(0, budgetPref - Math.floor(budgetPref * 0.2)),
          max: budgetPref + Math.floor(budgetPref * 0.2)
        };
        needsUpdate = true;
      }
      if (user.travelFrequency === undefined) {
        updateData.travelFrequency = "medium";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { $set: updateData });
        updatedCount++;
      }
    }

    console.log(`\nSuccessfully backfilled Phase 12 fields for ${updatedCount}/${users.length} users! 🎉`);
    process.exit(0);
  } catch (error) {
    console.error("Migration execution failed:", error);
    process.exit(1);
  }
};

runMigration();
