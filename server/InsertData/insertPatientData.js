const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Patient = require('../models/Patient');
const patientFakeData = require('../Data/Patientfakedata');

dotenv.config({ path: path.join(__dirname, '../.env') });

const insertData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        console.log('🧹 Clearing existing Patient data...');
        await Patient.deleteMany({});

        console.log('⬆️ Uploading 50 Fake Patient records sequentially to avoid Patient_Id collisions...');
        
        // Loop through and save each patient to ensure the auto-increment Patient_Id hook works correctly
        // Or manually calculate the ID here to speed it up.
        // Let's do it sequentially for safety and to reuse the model's logic.
        for (let i = 0; i < patientFakeData.length; i++) {
            const patient = new Patient(patientFakeData[i]);
            await patient.save();
            if ((i + 1) % 10 === 0) console.log(`🚀 Progress: ${i + 1}/50 patients uploaded...`);
        }

        console.log('🎉 50 Fake Patients uploaded successfully with hashed passwords and auto-generated Patient_IDs!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error uploading Patient data:', err.message);
        process.exit(1);
    }
};

insertData();
