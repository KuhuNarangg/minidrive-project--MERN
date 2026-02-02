const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/minidrive"); // Fallback if env missing in this context

        const email = "admin@minidrive.com";
        const password = "adminpassword";

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            email,
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin user created successfully");
        console.log("Email: " + email);
        console.log("Password: " + password);
        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
