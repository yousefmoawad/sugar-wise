const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    Image: {
        type: String,
        default: "../Images/Users/Default.jpg"
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ["Admin", "Doctor", "Patient", "Super Admin", "Guest"],
        default: "Guest"
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
    status: {
        type: String,
        enum: ["Online", "Offline"],
        default: "Offline"
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
