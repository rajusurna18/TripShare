import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../modules/auth/auth.model.js";

const run = async () => {
  try {
    await connectDB();
    const indexes = await User.collection.indexes();
    console.log("Indexes on User collection:");
    console.log(JSON.stringify(indexes, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
run();
