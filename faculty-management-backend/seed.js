require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const connectDB = require("./config/database");

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing admin data
    await Admin.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash("000", 10);

    // Insert default admin with hashed password
    await Admin.create({ email: "admin@example.com", password: hashedPassword });
    console.log("✅ Admin created: admin@example.com / 000");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
