const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PromoCode = require('../models/PromoCode');
const promoCodeFakeData = require('../Data/PromoCodefakedata');

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
        console.log("🔍 Fetching Products for PromoCode Relations...");
        const products = await mongoose.connection.collection('products').find().toArray();
        if (products.length === 0) {
            console.error("❌ No products found! Run inserProductsData.js first!");
            process.exit(1);
        }

        const mappedData = promoCodeFakeData.map((promo, index) => {
            const prod = products[index % products.length];
            return {
                ...promo,
                product: prod._id,
                applyProduct: {
                    image: prod.image1 || "",
                    productName: prod.name || "",
                    p_id: prod.p_id || 0
                }
            };
        });

        await PromoCode.collection.deleteMany({});
        await PromoCode.collection.insertMany(mappedData);
        console.log('🎉 50 Fake PromoCodes natively uploaded, successfully linking Products!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
