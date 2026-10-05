const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InsulinUnit = require('../models/InsulinUnits');
const fakeData = require('../Data/InsulinUnitsfakedata');

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
        await InsulinUnit.collection.deleteMany({});
        await InsulinUnit.collection.insertMany(fakeData);
        console.log('🎉 50 Fake Insulin Units natively uploaded!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
