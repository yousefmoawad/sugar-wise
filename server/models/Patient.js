const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const governorates = [
    "Cairo", "Alexandria", "Giza", "Sharqia", "Dakahlia", "Beheira", "Qalyubia",
    "Minya", "Asyut", "Gharbia", "Monufia", "Damietta", "Ismailia", "Port Said",
    "Suez", "Aswan", "Luxor", "Red Sea", "New Valley", "Matrouh", "North Sinai",
    "South Sinai", "Beni Suef", "Fayoum", "Sohag", "Qena", "Kafr El Sheikh"
];

// Role
const roles = [
    "Doctor",
    "Patient",
    "Admin",
    "Super Admin",
    "Guest"
];

const medicalConditions = ["Diabetes", "Hypertension", "Heart Disease", "None"];
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const patientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    role: {
        type: String,
        enum: roles,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: [true, 'Gender is required'],
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    governorate: {
        type: String,
        enum: governorates,
        required: [true, 'Governorate is required'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
    },
    height: {
        type: Number,
        required: [true, 'Height is required'],
    },
    medicalCondition: [{
        type: String,
        enum: medicalConditions,
    }],
    diabetesYears: {
        type: Number,
        default: 0,
    },
    bloodType: {
        type: String,
        enum: bloodTypes,
        required: [true, 'Blood type is required'],
    },
    profileImage: {
        type: String,
        default: "../Images/Users/Default.jpg" //Check this moawad
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    Status: {
        type: String,
        enum: ["Online", "Offline"],
        default: "Offline"
    },
    Patient_Id: {
        type: String,
        unique: true
    },
    DRFollow: {
        type: String,
        enum: ["follow", "unfollow"],
        default: "unfollow"
    },
    insulinPrimary: { type: String, default: '', trim: true },
    insulinPrimaryDosage: { type: String, default: '', trim: true },
    insulinSecondary: { type: String, default: '', trim: true },
    insulinSecondaryDosage: { type: String, default: '', trim: true },
    otherMedications: [
        {
            name: { type: String, trim: true },
            type: { type: String, trim: true },
            frequency: { type: String, trim: true }
        }
    ],
    currentLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        accuracy: { type: Number, default: null },
        label: { type: String, default: '', trim: true },
        updatedAt: { type: Date, default: null }
    },
}, {
    timestamps: true,
});

// Hash Password Hook
patientSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Auto-generate Patient_Id Hook
patientSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const lastPatient = await this.constructor.findOne({}, 'Patient_Id').sort({ Patient_Id: -1 });
            let nextIdNumber = 1;

            if (lastPatient && lastPatient.Patient_Id && lastPatient.Patient_Id.startsWith('PID_')) {
                const lastIdString = lastPatient.Patient_Id.replace('PID_', '');
                const lastIdNumber = parseInt(lastIdString, 10);
                if (!isNaN(lastIdNumber)) {
                    nextIdNumber = lastIdNumber + 1;
                }
            }

            const formattedNumber = nextIdNumber.toString().padStart(5, '0');
            this.Patient_Id = `PID_${formattedNumber}`;
        } catch (err) {
            throw err;
        }
    }
});

// Match Password Method
patientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
