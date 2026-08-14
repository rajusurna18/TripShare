import mongoose from 'mongoose';

async function wipeDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/TripShare');
    console.log("MongoDB Connected: 127.0.0.1/TripShare");

    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections.`);

    for (const collection of collections) {
      const name = collection.collectionName;
      if (name !== 'system.indexes' && name !== 'system.profile') {
        const countBefore = await collection.countDocuments();
        await collection.deleteMany({});
        const countAfter = await collection.countDocuments();
        console.log(`- Collection '${name}': deleted ${countBefore} documents. Remaining: ${countAfter}`);
      }
    }

    console.log("Database wipe completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error wiping database:", error);
    process.exit(1);
  }
}

wipeDatabase();
