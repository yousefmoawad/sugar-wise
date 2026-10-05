const mongoose = require('mongoose');
require('dotenv').config();
const MyPatient = require('../models/MyPatient');
const myPatientFakeData = require('../Data/MyPatientfakedata');

const insertData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const patients = await mongoose.connection.collection('patients').find().toArray();
        const doctors = await mongoose.connection.collection('doctors').find().toArray();
        const sinsors = await mongoose.connection.collection('sinsors').find().toArray();
        const dms = await mongoose.connection.collection('diabetesmonitorings').find().toArray();

        if (patients.length === 0 || doctors.length === 0 || sinsors.length === 0 || dms.length === 0) {
            console.error("❌ Required relations map missing! Verify Patients, Doctors, Sinsors, and DiabetesMonitorings are loaded.");
            process.exit(1);
        }

        const mappedData = myPatientFakeData.map((pt, index) => {
            const patientData = patients[index % patients.length];
            const doctorData = doctors[index % doctors.length];
            const sinsorData = sinsors[index % sinsors.length];
            const dmData = dms[index % dms.length];

            // Safely calculate age from patient data native bypass
            let ageCalc = 0;
            if (patientData.birthday) {
                const birthDate = new Date(patientData.birthday);
                const today = new Date();
                ageCalc = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    ageCalc--;
                }
            }

            return {
                ...pt,
                patient: patientData._id,
                patientFullName: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
                patientId: patientData.Patient_Id || "",
                age: ageCalc,

                doctor: doctorData._id,
                doctorFullName: `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim(),
                doctorId: doctorData.doctorId || "",

                sinsor: sinsorData._id,
                glucose: sinsorData.Gloucose || 0,

                diabetesMonitoring: dmData._id,
                insulinType: dmData.insulinType || "",
                insulinUnits: dmData.insulinUnits || 0
            };
        });

        await MyPatient.collection.deleteMany({});
        await MyPatient.collection.insertMany(mappedData);
        console.log('🎉 50 Fully Mastered MyPatients securely constructed natively utilizing ALL dependencies correctly!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error handling DB', err);
        process.exit(1);
    }
};
insertData();
