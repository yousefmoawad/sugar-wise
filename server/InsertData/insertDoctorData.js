const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 1. Import your Mongoose doctor model
const Doctor = require('../models/Doctor');

// 2. Import the 50 fake doctors we just generated
const doctorFakeData = require('../Data/Doctorfakedata');

// Load environment variables for DB Connection
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB successfully connected`);
    } catch (error) {
        console.error(`❌ Connection error: ${error.message}`);
        process.exit(1);
    }
};

const insertData = async () => {
    // 3. Connect to database
    await connectDB();

    try {
        // 4. Secure passwords with bcrypt before saving
        console.log("🔒 Hashing doctor passwords...");
        for (let data of doctorFakeData) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        // Remove existing duplicate doctor mock data IDs to prevent error
        const idsToDrop = doctorFakeData.map(d => d.doctorId);
        await Doctor.collection.deleteMany({ doctorId: { $in: idsToDrop } });

        // 5. Insert to MongoDB compass natively (bypasses any Mongoose hook bugs)
        console.log("⬆️ Uploading doctor data to Database...");
        await Doctor.collection.insertMany(doctorFakeData);

        console.log('🎉 50 Fake Doctors were successfully uploaded to MongoDB Compass!');
        process.exit();

    } catch (error) {
        console.error(`❌ Error uploading data:`, error.message);
        process.exit(1);
    }
};

// Start the function
insertData();
