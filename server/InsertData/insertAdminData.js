const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const adminFakeData = require('../Data/Adminfakedata');

dotenv.config();

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("🔒 Encrypting explicit staff passwords safely natively...");
        const mappedData = [];
        for (const admin of adminFakeData) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(admin.password, salt);
            mappedData.push({ ...admin, password: hashedPassword });
        }

        await Admin.collection.deleteMany({});
        await Admin.collection.insertMany(mappedData);
        console.log('🎉 10 Fake Admins hashed & natively uploaded directly to DB mapped safely!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
