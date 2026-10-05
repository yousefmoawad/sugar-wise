const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VerificationDoctor = require('../models/VerificationDoctor');
const fakeData = require('../Data/VerificationDoctorfakedata');

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
        console.log("🔍 Fetching Doctors for Verification linking natively...");
        const doctors = await mongoose.connection.collection('doctors').find().toArray();
        if (doctors.length === 0) {
            console.error("❌ No doctors found! Verification explicitly requires Doctor objects.");
            process.exit(1);
        }

        const mappedData = fakeData.map((obj, index) => {
            const doc = doctors[index % doctors.length];
            return {
                ...obj,
                doctor: doc._id,
                fullName: `${doc.firstName} ${doc.lastName}`.trim(),
                medicalSpecialty: doc.medicalSpecialty || "",
                selfImg: doc.selfImg || ""
            };
        });

        await VerificationDoctor.collection.deleteMany({});
        await VerificationDoctor.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Verification Records sequentially bound directly to your existing Doctors successfully natively!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
