const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Selling = require('../models/Selling');
const sellingFakeData = require('../Data/Sellingfakedata');

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
        console.log("🔍 Fetching Payments for Selling mapping...");
        const payments = await mongoose.connection.collection('payments').find().toArray();
        if (payments.length === 0) {
            console.error("❌ No payments found! Selling explicitly requires Payment objects.");
            process.exit(1);
        }

        const mappedData = sellingFakeData.map((sellingObj, index) => {
            const payment = payments[index % payments.length];
            return {
                ...sellingObj,
                payment: payment._id,
                paymentMethod: payment.paymentMethod || "",
                fullName: payment.fullName || "",
                orderId: payment.orderId || "",
                Date: payment.Date || new Date(),
                product: payment.product || null,
                name: payment.name || "",
                price: payment.price || 0
            };
        });

        await Selling.collection.deleteMany({});
        await Selling.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Selling Records mapped sequentially against Payments successfully natively!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
