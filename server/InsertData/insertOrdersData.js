const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Order = require('../models/Orders');
const ordersFakeData = require('../Data/Ordersfakedata');

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
        console.log("🔍 Fetching Payment Relations from Database...");
        const payments = await mongoose.connection.collection('payments').find().toArray();
        if (payments.length === 0) {
            console.error("❌ No Payment records found in Database! Orders REQUIRE valid Payment associations.");
            process.exit(1);
        }

        console.log("🔗 Binding relational variables cleanly across Schemas (Payment and BookDoctor)...");
        const mappedData = ordersFakeData.map((data, index) => {
            const payment = payments[index % payments.length];
            return {
                ...data,
                payment: payment._id,
                orderId: payment.orderId, // Mongoose hook natively mimics this
                price: payment.price || 0,
                // Clinic Fields will be empty by default since these relate purely to Payment objects currently
                clinicImage: "",
                clinicName: "",
                day: [],
                time: []
            };
        });

        console.log("⬆️ Uploading 50 Explicit Order Records natively escaping Mongoose Hook validation bindings...");
        await Order.collection.insertMany(mappedData);

        console.log('🎉 All 50 Fake Orders explicitly pushed to MongoDB via compass bypass!');
        process.exit();

    } catch (error) {
        console.error(`❌ Exception:`, error.message || error);
        process.exit(1);
    }
};

insertData();
