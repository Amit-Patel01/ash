const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: __dirname + "/../.env" });

const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solutionhub";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const usersCol = db.collection("users");

    // Default admin email
    const email = "support@amitsolutionhub.com";
    const password = "Admin@123";
    const passwordHash = await bcrypt.hash(password, 12);

    // Find the user first
    const existingUser = await usersCol.findOne({ email });

    if (existingUser) {
      // Update password hash and role
      const result = await usersCol.updateOne(
        { _id: existingUser._id },
        { 
          $set: { 
            passwordHash,
            role: "admin",
            updatedAt: new Date()
          } 
        }
      );
      console.log(`Updated existing admin user ${email}:`, result);
    } else {
      // Create new admin user
      const newUser = {
        uid: "admin-uid-123", // or custom string ID
        email,
        displayName: "Amit Patel",
        role: "admin",
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await usersCol.insertOne(newUser);
      console.log(`Inserted new admin user ${email}:`, result);
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    await client.close();
  }
}

run();
