const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('../models/Notification');
const notificationFakeData = require('../Data/Notificationfakedata');

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected`);

        console.log("🔍 Extracting relations from DB natively (BookDoctor, DiabetesMonitoring, Sinsor, MyPatient)...");
        const bookDoctors = await mongoose.connection.collection('bookdoctors').find().toArray();
        const dms = await mongoose.connection.collection('diabetesmonitorings').find().toArray();
        const sinsors = await mongoose.connection.collection('sinsors').find().toArray();
        const myPatients = await mongoose.connection.collection('mypatients').find().toArray();

        if (!bookDoctors.length || !dms.length || !sinsors.length || !myPatients.length) {
            console.error("❌ Missing foundational dependencies to build notifications. Ensure previous scripts ran.");
            process.exit(1);
        }

        const mappedData = notificationFakeData.map((notif, index) => {
            const bDoc = bookDoctors[index % bookDoctors.length];
            const dm = dms[index % dms.length];
            const sinsorObj = sinsors[index % sinsors.length];
            const pat = myPatients[index % myPatients.length];

            return {
                ...notif,

                // Inheriting BookDoctor dynamically
                bookDoctor: bDoc._id,
                clinicName: bDoc.clinicName || "",
                time: bDoc.time || [],
                date: bDoc.day || [], // Matches the schema explicit hook mapping "day" to "date"

                // Inheriting DiabetesMonitoring
                diabetesMonitoring: dm._id,
                status: dm.status || "",

                // Inheriting Sinsor
                sinsor: sinsorObj._id,
                glucose: sinsorObj.Gloucose || 0,

                // Inheriting MyPatient
                myPatient: pat._id,
                feedBack: pat.sendFeedBack || ""
            };
        });

        await Notification.collection.deleteMany({});
        await Notification.collection.insertMany(mappedData);
        console.log(`🎉 Success! 50 Fake Notifications heavily embedded with 4 native schema relations uploaded to Compass!`);
        process.exit(0);

    } catch (err) {
        console.error('❌ DB Error', err);
        process.exit(1);
    }
};
insertData();
