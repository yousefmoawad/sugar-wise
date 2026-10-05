const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BookDoctor = require('../models/BookDoctor');
const bookDoctorFakeData = require('../Data/BookDoctorfakedata');

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
        console.log("🔍 Fetching Clinics and matching Doctors natively...");
        const clinics = await mongoose.connection.collection('myclinics').find().toArray();
        if (clinics.length === 0) {
            console.error("❌ No clinics found! Run insertMyClinicData.js first!");
            process.exit(1);
        }

        const doctors = await mongoose.connection.collection('doctors').find().toArray();

        const mappedData = bookDoctorFakeData.map((booking, index) => {
            const clinic = clinics[index % clinics.length];

            // Ensure we grab the matching doctor assigned to that exact clinic!
            const docId = clinic.doctor;
            const doctorObj = doctors.find(d => String(d._id) === String(docId)) || doctors[0];

            return {
                ...booking,
                doctor: doctorObj._id,
                myClinic: clinic._id,
                fullName: clinic.fullName, // Inherited from clinic pre-hook
                doctorId: clinic.doctorId,
                clinicName: clinic.name,
                clinicImage: clinic.image,
                price: clinic.price,
                day: clinic.workingDays,
                GoogleMapUrl: clinic.GoogleMapUrl || ""
            };
        });

        await BookDoctor.collection.deleteMany({});
        await BookDoctor.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Bookings natively uploaded, successfully linking Doctors and corresponding Clinics safely!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
