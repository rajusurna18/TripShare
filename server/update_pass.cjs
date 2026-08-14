const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TripShare');
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('password123', 10);
  await db.collection('users').updateOne({email: '24eg105a54@anurag.edu.in'}, {$set: {password: hash}});
  console.log('Password updated for test user');
  mongoose.disconnect();
})().catch(console.error);
