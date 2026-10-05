const mongoose = require('mongoose');
require('dotenv').config();
const DiabetesMonitoring = require('../models/DiabetesMonitoring');
const dmFakeData = require('../Data/DiabetesMonitoringfakedata');

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const sinsors = await mongoose.connection.collection('sinsors').find().toArray();
        const diets = await mongoose.connection.collection('dietlysystems').find().toArray();

        if (sinsors.length === 0 || diets.length === 0) {
            console.error("❌ Need both Sinsors and DietlySystems to map relations!");
            process.exit(1);
        }

        const mappedData = dmFakeData.map((dm, index) => {
            const sinsorObj = sinsors[index % sinsors.length];
            const dietObj = diets[index % diets.length];

            return {
                ...dm,
                sinsor: sinsorObj._id,
                glucose: sinsorObj.Gloucose || 0,
                date: sinsorObj.Date || new Date(),
                time: sinsorObj.Time || "",

                dietlySystem: dietObj._id,
                image: (dietObj.images && dietObj.images.length > 0) ? dietObj.images[0] : "",
                name: dietObj.name || "",
                mealDescription: dietObj.mealDescription || ""
            };
        });

        await DiabetesMonitoring.collection.deleteMany({});
        await DiabetesMonitoring.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Diabetes Monitoring Records mapped flawlessly across Sinsor & Dietary relations natively!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
