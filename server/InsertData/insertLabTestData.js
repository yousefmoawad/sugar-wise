const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const LabTest = require('../models/LabTest');
const labTestFakeData = require('../Data/LabTestfakedata');

dotenv.config({ path: path.join(__dirname, '../.env') });

const insertData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        console.log('🧹 Clearing existing LabTest data...');
        await LabTest.collection.deleteMany({});

        // Convert string IDs to ObjectIds for the productId field
        const mappedData = labTestFakeData.map(item => ({
            ...item,
            productId: item.productId ? new mongoose.Types.ObjectId(item.productId) : null
        }));

        console.log('⬆️ Uploading 50 Fake LabTest records...');
        await LabTest.collection.insertMany(mappedData);

        console.log('🎉 50 Fake LabTests uploaded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error uploading LabTest data:', err.message);
        process.exit(1);
    }
};

insertData();
