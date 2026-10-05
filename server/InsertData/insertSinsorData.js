const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Sinsor = require('../models/Sinsor');
const sinsorFakeData = require('../Data/Sinsorfakedata');

dotenv.config({ path: path.join(__dirname, '../.env') });

const insertData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        console.log('🧹 Clearing existing Sinsor data...');
        await Sinsor.collection.deleteMany({});

        console.log('⬆️ Uploading 50 Fake Sinsor readings...');
        await Sinsor.collection.insertMany(sinsorFakeData);

        console.log('🎉 50 Fake Sinsor readings uploaded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error uploading Sinsor data:', err.message);
        process.exit(1);
    }
};

insertData();
