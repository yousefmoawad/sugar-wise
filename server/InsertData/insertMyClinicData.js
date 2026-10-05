const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MyClinic = require('../models/MyClinic');
const myClinicFakeData = require('../Data/MyClinicfakedata');

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
        console.log("🔍 Fetching Doctors...");
        const doctors = await mongoose.connection.collection('doctors').find().toArray();
        if (doctors.length === 0) {
            console.error("❌ No doctors found! Need doctors to assign clinics.");
            process.exit(1);
        }

        console.log("🔗 Binding Clinics to real Doctors natively...");
        const mappedData = myClinicFakeData.map((clinic, index) => {
            const doc = doctors[index % doctors.length];
            return {
                ...clinic,
                doctor: doc._id,
                fullName: `${doc.firstName} ${doc.lastName}`.trim(),
                doctorId: doc.doctorId || ""
            };
        });

        await MyClinic.collection.deleteMany({}); // clearing to avoid duplicates usually optional
        await MyClinic.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Clinics properly linked to Doctors and Inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ DB Error', err);
        process.exit(1);
    }
};
insertData();
