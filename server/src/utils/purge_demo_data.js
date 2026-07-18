import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";

// Models
import User from "../modules/auth/auth.model.js";
import Trip from "../modules/trip/trip.model.js";
import Activity from "../modules/activity/activity.model.js";
import Blog from "../modules/blog/blog.model.js";
import Friend from "../modules/friend/friend.model.js";
import Memory from "../modules/memory/memory.model.js";
import Review from "../modules/review/review.model.js";

const purgeData = async () => {
  try {
    console.log("Connecting to database to purge demo data...");
    await connectDB();
    console.log("Database connected successfully.");

    console.log("Purging activities...");
    await Activity.deleteMany({});
    console.log("Purging blogs...");
    await Blog.deleteMany({});
    console.log("Purging trips...");
    await Trip.deleteMany({});
    console.log("Purging memories...");
    await Memory.deleteMany({});
    console.log("Purging reviews...");
    await Review.deleteMany({});
    
    // CAUTION: Uncomment these if you want to wipe users and friends as well
    // console.log("Purging friends...");
    // await Friend.deleteMany({});
    // console.log("Purging users...");
    // await User.deleteMany({});

    console.log(`\nSuccessfully purged demo data! 🎉`);
    console.log(`Note: Users and Friends were not deleted. Uncomment lines in the script if you wish to wipe users too.`);
    process.exit(0);
  } catch (error) {
    console.error("Purge execution failed:", error);
    process.exit(1);
  }
};

purgeData();
