const mongoose = require('mongoose');
require('dotenv').config();

const SuperAdmin = require('../models/SuperAdmin');
const fakeData = require('../Data/SuperAdminfakedata');

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await SuperAdmin.collection.deleteMany({});
        await SuperAdmin.collection.insertMany(fakeData);
        console.log('🎉 10 Fake Super Admins explicitly bypassed natively to Compass database!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
