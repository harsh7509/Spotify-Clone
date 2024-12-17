//db.js
const mongoose = require("mongoose");
require('dotenv').config();  // Load environment variables

module.exports = async () => {
    const DB = process.env.DB;

    console.log("Database URI:", DB);  // Confirm URI is correct

    try {
        await mongoose.connect(DB);  // No need for connectionParams
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
