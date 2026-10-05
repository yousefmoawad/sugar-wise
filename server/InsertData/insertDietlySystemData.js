const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DietlySystem = require('../models/DietlySystem');
const dietlyFakeData = require('../Data/DietlySystemfakedata');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

const insertData = async () => {
    await connectDB();
    try {
        console.log("🔍 Fetching Patients for Dietly System Mapping...");
        const patients = await mongoose.connection.collection('patients').find().toArray();
        if (patients.length === 0) {
            console.error("❌ No patients found in Database! DietlySystem REQUIRES a valid Patient.");
            process.exit(1);
        }

        const mappedData = dietlyFakeData.map((diet, index) => {
            const patient = patients[index % patients.length];
            return {
                ...diet,
                patient: patient._id,
                fullName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
                patientId: patient.Patient_Id || '' // Safely mapped natively from db bypass hook
            };
        });

        await DietlySystem.collection.deleteMany({});
        await DietlySystem.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Dietary Meals securely bound to live Patients natively bypassing hooks!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
