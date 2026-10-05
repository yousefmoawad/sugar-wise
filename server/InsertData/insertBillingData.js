const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Billing = require('../models/Billing');
const billingFakeData = require('../Data/Billingfakedata');

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
        await Billing.collection.deleteMany({});
        await Billing.collection.insertMany(billingFakeData);
        console.log('🎉 50 Fake Billing records natively uploaded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
