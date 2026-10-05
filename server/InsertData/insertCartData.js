const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('../models/Cart');
const cartFakeData = require('../Data/Cartfakedata');

dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

const insertData = async () => {
    await connectDB();
    try {
        const products = await mongoose.connection.collection('products').find().toArray();
        const promoCodes = await mongoose.connection.collection('promocodes').find().toArray();

        if (products.length === 0) {
            console.error("❌ Products missing for Cart relation!");
            process.exit(1);
        }

        const mappedData = cartFakeData.map((cart, index) => {
            const prod = products[index % products.length];
            const promo = promoCodes.length > 0 ? promoCodes[index % promoCodes.length] : null;

            return {
                ...cart,
                product: prod._id,
                promoCode: promo ? promo._id : null,
                p_id: prod.p_id || 0,
                name: prod.name || "",
                image1: prod.image1 || "",
                promoCodeName: promo ? promo.promoCodeName : ""
            };
        });

        await Cart.collection.deleteMany({});
        await Cart.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Cart Items uniquely bound to Products/PromoCodes successfully uploaded!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error', err);
        process.exit(1);
    }
};
insertData();
