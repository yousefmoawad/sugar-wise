const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shop = require('../models/Shop');
const shopFakeData = require('../Data/Shopfakedata');

dotenv.config();
const connectDB = async () => {
    try { await mongoose.connect(process.env.MONGO_URI); }
    catch (e) { process.exit(1); }
};

const insertData = async () => {
    await connectDB();
    try {
        const products = await mongoose.connection.collection('products').find().toArray();
        if (products.length === 0) { process.exit(1); }

        const mappedData = shopFakeData.map((shop, index) => {
            const prod = products[index % products.length];
            return {
                ...shop,
                product: prod._id,
                name: prod.name || "",
                price: prod.price || 0,
                image1: prod.image1 || "",
                rate: prod.rate || 0,
                category: (prod.category && prod.category.length > 0) ? prod.category[0] : ""
            };
        });

        await Shop.collection.deleteMany({});
        await Shop.collection.insertMany(mappedData);
        console.log('🎉 50 Fake Shop entries cloned flawlessly directly from Product mappings!');
        process.exit(0);
    } catch (err) { process.exit(1); }
};
insertData();
