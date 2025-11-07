// testMongo.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // loads variables from .env file

// Use your own MongoDB URI from .env
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/testdb";

async function testMongoConnection() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connection successful!");

    // Simple test schema
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model("Test", testSchema);

    // Insert a test document
    const doc = await Test.create({ name: "MongoDB connection test" });
    console.log("📄 Document inserted:", doc);

    // Fetch documents
    const allDocs = await Test.find();
    console.log("📚 All documents in collection:", allDocs);

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

testMongoConnection();
