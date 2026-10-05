const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected`);

        console.log("🔍 Extracting ALL foundational roles from DB natively (Patients, Doctors, Admins, SuperAdmins)...");
        const patients = await mongoose.connection.collection('patients').find().toArray();
        const doctors = await mongoose.connection.collection('doctors').find().toArray();
        const admins = await mongoose.connection.collection('admins').find().toArray();
        const superAdmins = await mongoose.connection.collection('superadmins').find().toArray();

        let allUsers = [];
        let emailSet = new Set();

        const getUniqueEmail = (baseEmail, role, id) => {
            let e = (baseEmail || "").toLowerCase();
            if (!e || emailSet.has(e)) {
                e = `${role.toLowerCase()}_${Math.random().toString(36).substring(7)}@sugarwise.com`;
            }
            // Ensure absolute uniqueness
            while (emailSet.has(e)) {
                e = `${role.toLowerCase()}_${Math.random().toString(36).substring(7)}@sugarwise.com`;
            }
            emailSet.add(e);
            return e;
        };

        // 1. Inherit all Patients
        for (const data of patients) {
            allUsers.push({
                patient: data._id,
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                image: data.profileImage || "",
                role: data.role || "Patient",
                status: data.Status ? data.Status.toLowerCase() : "offline",
                email: getUniqueEmail(data.email, 'Patient', data._id),
                password: data.password || "Password123!",
                Action: "Delete"
            });
        }

        // 2. Inherit all Doctors
        for (const data of doctors) {
            allUsers.push({
                doctor: data._id,
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                image: data.profileImage || "",
                role: data.role || "Doctor",
                status: data.Status ? data.Status.toLowerCase() : "offline",
                email: getUniqueEmail(data.email, 'Doctor', data._id),
                password: data.password || "Password123!",
                Action: "Delete"
            });
        }

        // 3. Inherit all Admins
        for (const data of admins) {
            allUsers.push({
                admin: data._id,
                name: data.name || "",
                image: data.Image || "",
                role: data.role || "Admin",
                status: data.status ? data.status.toLowerCase() : "offline",
                email: getUniqueEmail(data.email, 'Admin', data._id),
                password: data.password || "Password123!",
                Action: "Delete"
            });
        }

        // 4. Inherit all Super Admins
        for (const data of superAdmins) {
            allUsers.push({
                superAdmin: data._id,
                name: data.name || "",
                image: data.Image || "",
                role: data.role || "Super Admin",
                status: data.status ? data.status.toLowerCase() : "offline",
                email: getUniqueEmail("", 'SuperAdmin', data._id),
                password: "Password123!",
                Action: "Delete"
            });
        }

        console.log(`🔗 Found ${allUsers.length} universally merging entities. Mapping safely...`);

        await User.collection.deleteMany({});
        await User.collection.insertMany(allUsers);

        console.log(`🎉 Success! Your universal 'User' collection resolved all strict duplicate indexing natively!`);
        process.exit(0);

    } catch (err) {
        console.error('❌ DB Error', err);
        process.exit(1);
    }
};
insertData();
