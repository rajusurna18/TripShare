import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "../config/db.js";

const run = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const indexes = await db.collection("users").indexes();
  console.log("Indexes on 'users' collection:");
  console.log(JSON.stringify(indexes, null, 2));
  process.exit(0);
};

run().catch(console.error);
