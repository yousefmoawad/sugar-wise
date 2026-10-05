const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
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

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdmin;
