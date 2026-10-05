const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load Mongoose models
const Payment = require('../models/Payment');

// Load fake payment data
const paymentFakeData = require('../Data/Paymentfakedata');

dotenv.config();

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
        console.log("🔍 Fetching available Products to link relations...");

        // Fetch products without strict model to avoid crashes if schema is unimported
        let products = await mongoose.connection.collection('products').find({}).toArray();

        if (!products || products.length === 0) {
            console.log("⚠️ No products found in the database! Creating a dummy product to satisfy the relational schema...");
            await mongoose.connection.collection('products').insertOne({
                name: "Test Medical Kit",
                price: 150,
                description: "Basic medical kit for testing.",
                image1: "https://example.com/kit.jpg",
                category: "Medical"
            });
            products = await mongoose.connection.collection('products').find({}).toArray();
        }

        console.log("🔗 Mapping relational IDs (product) and generating unique Order IDs...");

        let nextIdNumber = 1000; // Default baseline for mock orderIds

        const mappedData = paymentFakeData.map((data, index) => {
            // 1. Relational Binding: Assign an actual Product _id from the Database
            const randomProduct = products[index % products.length];

            // 2. Data injection based on Payment Mongoose Hook Logic
            const formattedNumber = String(nextIdNumber + index).padStart(5, '0');
            const orderId = `#ORD_${formattedNumber}`;

            return {
                ...data,
                product: randomProduct._id,
                image1: randomProduct.image1 || "",
                name: randomProduct.name || "Unknown Product",
                price: randomProduct.price || 0,
                orderId: orderId,
            };
        });

        console.log("♻️ Removing existing mock orders with same identifiers to prevent duplicates...");
        const orderIdsToDrop = mappedData.map(d => d.orderId);
        await Payment.collection.deleteMany({ orderId: { $in: orderIdsToDrop } });

        console.log("⬆️ Uploading exactly 50 completely formatted payments bypassing unstable middleware...");
        await Payment.collection.insertMany(mappedData);

        console.log('🎉 All 50 Fake Payments uploaded successfully matching your Models and DB Relations!');
        process.exit();

    } catch (error) {
        console.error(`❌ Error uploading data:`, error.message);
        process.exit(1);
    }
};

insertData();
