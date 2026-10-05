const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ContactUs = require('../models/ContactUs');
const contactUsFakeData = require('../Data/ContactUsfakedata');

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
        await ContactUs.collection.deleteMany({});
        await ContactUs.collection.insertMany(contactUsFakeData);
        console.log('🎉 50 Fake ContactUs messages natively uploaded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
