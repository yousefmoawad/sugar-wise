// backend/models/Doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Arrays for Dropdowns
const universityNames = [
    "Cairo University (Kasr Al-Ainy)", "Ain Shams University", "Alexandria University",
    "Mansoura University", "Assiut University", "Tanta University", "Helwan University",
    "Zagazig University", "Al-Azhar University", "Suez Canal University", "Minia University",
    "Menoufia University", "Beni Suef University", "Benha University", "Fayoum University",
    "Sohag University", "Kafrelsheikh University", "Port Said University", "Aswan University",
    "Suez University", "Damietta University", "Luxor University", "Arish University",
    "New Valley University", "Galala University (GU)", "King Salman International University (KSIU)",
    "Alamein International University (AIU)", "New Mansoura University", "Beni Suef National University",
    "Assiut National University", "Alexandria National University", "Minia National University",
    "East Port Said National University", "Misr University for Science and Technology (MUST)",
    "October 6 University (O6U)", "Newgiza University (NGU)", "Badr University in Cairo (BUC)",
    "Nahda University (NUB)", "Future University in Egypt (FUE)", "Delta University for Science and Technology",
    "Modern University for Technology and Information (MTI)", "Horus University", "Sinai University", "Merit University"
];

// Role
const roles = [
    "Doctor",
    "Patient",
    "Admin",
    "Super Admin",
    "Guest"
];

// Keep this list for UI helpers, but do not hard-enforce enum on the schema,
// because the client may send additional values (e.g., "Internal Medicine").
const medicalSpecialties = [
    "Cardiology", "Endocrinology", "Internal Medicine", "Neurology", "Pediatrics",
    "General Surgery", "General Practitioner", "Diabetes Specialist", "Nephrology",
    "Ophthalmology", "Dermatology", "Gastroenterology", "Psychiatry", "Nutritionist",
    "Orthopedics", "ENT"
];

const governorates = [
    "Cairo", "Alexandria", "Giza", "Sharqia", "Dakahlia", "Beheira", "Qalyubia",
    "Minya", "Asyut", "Gharbia", "Monufia", "Damietta", "Ismailia", "Port Said",
    "Suez", "Aswan", "Luxor", "Red Sea", "New Valley", "Matrouh", "North Sinai",
    "South Sinai", "Beni Suef", "Fayoum", "Sohag", "Qena", "Kafr El Sheikh"
];

// 2. The Doctor Schema
const doctorSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        unique: true,
    },
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
        // Accept both cases; we normalize in a pre-save hook.
        enum: ['Male', 'Female', 'male', 'female'],
        required: [true, 'Gender is required'],
    },
    phoneNumber: {
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
    university: {
        type: String,
        required: [true, 'University is required'],
        trim: true,
    },
    medicalSpecialty: {
        type: String,
        required: [true, 'Medical specialty is required'],
        trim: true,
    },
    yearsOfExperience: {
        type: Number,
        default: 0,
        min: 0,
    },
    nationalID: {
        type: String,
        default: '',
        trim: true,
    },
    // --- NEW FIELDS ADDED BELOW ---
    birthday: {
        type: Date, // Date type is best for storing birthdays
        required: [true, 'Birthday is required'],
    },
    idFrontImg: {
        type: String, // String to hold the URL/Path of the uploaded image
        required: [true, 'ID Front Image is required'],
    },
    idBackImg: {
        type: String, // String to hold the URL/Path
        required: [true, 'ID Back Image is required'],
    },
    selfImg: {
        type: String, // String to hold the URL/Path
        required: [true, 'Personal photo is required'],
    },
    graduation: {
        type: String, // E.g., Graduation year or a string path to graduation certificate
        required: [true, 'Graduation info/certificate is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    governorate: {
        type: String,
        required: [true, 'Governorate is required'],
        trim: true,
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
    },
    profileImage: {
        type: String,
        default: ""
    },
    /** Optional profile fields used by edit profile UI */
    title: {
        type: String,
        default: '',
        trim: true,
    },
    bio: {
        type: String,
        default: '',
        trim: true,
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
        },
    ],
    patientRatings: [
        {
            patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
            value: { type: Number, min: 1, max: 5 },
            updatedAt: { type: Date, default: Date.now },
        },
    ],
    Status:{
        type: String,
        enum: ["Online", "Offline"],
        default: "Offline"
    }
}, {
    timestamps: true,
});

// 3. Auto-Generate DR... ID Hook
doctorSchema.pre('save', async function () {
    if (this.isNew) {
        const lastDoctor = await mongoose.model('Doctor').findOne({}, 'doctorId').sort({ createdAt: -1 });

        if (lastDoctor && lastDoctor.doctorId) {
            const lastIdNumber = parseInt(lastDoctor.doctorId.replace('DR', ''), 10);
            this.doctorId = `DR${lastIdNumber + 1}`;
        } else {
            this.doctorId = 'DR1000';
        }
    }
});

// Normalize gender casing.
doctorSchema.pre('save', function () {
    if (this.isModified('gender') && this.gender) {
        const g = String(this.gender).trim().toLowerCase();
        this.gender = g === 'female' ? 'Female' : 'Male';
    }
});

// 4. Hash Password Hook
doctorSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 5. Match Password Method
doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 6. Static helpers for Frontend dropdowns
doctorSchema.statics.getUniversities = () => universityNames;
doctorSchema.statics.getSpecialties = () => medicalSpecialties;
doctorSchema.statics.getGovernorates = () => governorates; // Added Governorate helper

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
