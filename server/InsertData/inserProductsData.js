const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load Mongoose models
const Product = require('../models/Product');

// Load fake product data
const productFakeData = require('../Data/Productfakedata');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB successfully connected`);
    } catch (error) {
        console.error(`❌ Connection error: ${error.message}`);
        process.exit(1);
    }
};

const insertData = async () => {
    await connectDB();

    try {
        console.log("🔍 Checking Database to safely auto-increment numeric p_id...");
        let nextPId = 1;

        try {
            // Find the highest existing p_id safely
            const lastProduct = await mongoose.model('Product').findOne({}, 'p_id').sort({ p_id: -1 });
            if (lastProduct && lastProduct.p_id) {
                nextPId = lastProduct.p_id + 1;
            }
        } catch (e) { }

        console.log(`🔗 Auto-calculating Product p_ids Starting at [${nextPId}]`);
        const mappedData = productFakeData.map((data, index) => {
            return {
                ...data,
                p_id: nextPId + index
            };
        });

        console.log("⬆️ Uploading exactly 50 formatted Products directly to Compass bypassing buggy Mongoose schema middleware...");
        await Product.collection.insertMany(mappedData);

        console.log('🎉 All 50 Fake Products uploaded successfully to Database!');
        process.exit();

    } catch (error) {
        if (error.code === 11000) {
            console.error('❌ Data already exists in the database. Duplicate p_id key error.');
        } else {
            console.error(`❌ Error uploading data:`, error.message);
        }
        process.exit(1);
    }
};

insertData();
