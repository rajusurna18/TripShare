import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../modules/auth/auth.model.js";
import connectDB from "../config/db.js";
import { computeStatsObj } from "../modules/profile/profile.service.js";

const runMigration = async () => {
  try {
    console.log("Connecting to database for legacy stats backfill...");
    await connectDB();
    console.log("Database connected successfully.");

    const users = await User.find({});
    console.log(`Found ${users.length} user documents to evaluate...`);

    let updatedCount = 0;
    for (const user of users) {
      console.log(`Calculating stats for user: ${user.name} (${user._id})...`);
      const stats = await computeStatsObj(user, user._id);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          trustScore: stats.trustScore || 10,
          profileCompletion: stats.profileCompletion || 0,
          followersCount: stats.followersCount || 0,
          followingCount: stats.followingCount || 0,
        },
      });
      updatedCount++;
    }

    console.log(`\nSuccessfully backfilled stats for ${updatedCount}/${users.length} users! 🎉`);
    process.exit(0);
  } catch (error) {
    console.error("Migration execution failed:", error);
    process.exit(1);
  }
};

runMigration();
