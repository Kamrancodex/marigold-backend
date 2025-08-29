const mongoose = require("mongoose");
const TeamMember = require("../models/TeamMember");
require("dotenv").config();

const removeYearsExperienceField = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Remove yearsExperience field from all existing team members
    const result = await TeamMember.updateMany(
      {},
      { $unset: { yearsExperience: "" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} team members`);
    console.log("Removed yearsExperience field from all team members");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing yearsExperience field:", error);
    process.exit(1);
  }
};

// Run the migration
removeYearsExperienceField();

