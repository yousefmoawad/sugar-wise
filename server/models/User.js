const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Relations to the 4 specific models
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    superAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },

    // Inherited / aggregated fields
    image: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline"
    },
    /**
     * Used for presence. We treat a user as online if lastSeenAt is recent.
     * This is more reliable than trying to perfectly track browser close/logout.
     */
    lastSeenAt: {
        type: Date,
        default: null
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    Action: {
        type: String,
        enum: ["Delete"],
        default: "Delete"
    },

    // Legacy auth fields retained as optional just in case
    email: { type: String, lowercase: true, trim: true },
    password: { type: String }
}, {
    timestamps: true
});

userSchema.index({ lastSeenAt: -1 });

// Pre-save hook to aggregate data from matched collections
userSchema.pre('save', async function () {
    try {
        if (this.isModified('patient') || (this.isNew && this.patient)) {
            const Patient = mongoose.model('Patient');
            const data = await Patient.findById(this.patient);
            if (data) {
                this.name = `${data.firstName} ${data.lastName}`.trim();
                this.image = data.profileImage;
                this.role = data.role;
                this.status =
                    String(data.Status || 'Offline').trim().toLowerCase() === 'online'
                        ? 'online'
                        : 'offline';
                this.joinDate = data.joinDate;
                this.email = data.email;
                this.password = data.password;
            }
        }
        else if (this.isModified('doctor') || (this.isNew && this.doctor)) {
            const Doctor = mongoose.model('Doctor');
            const data = await Doctor.findById(this.doctor);
            if (data) {
                this.name = `${data.firstName} ${data.lastName}`.trim();
                this.image = data.profileImage;
                this.role = data.role;
                this.status =
                    String(data.Status || 'Offline').trim().toLowerCase() === 'online'
                        ? 'online'
                        : 'offline';
                this.joinDate = data.joinDate;
                this.email = data.email;
                this.password = data.password;
            }
        }
        else if (this.isModified('admin') || (this.isNew && this.admin)) {
            const Admin = mongoose.model('Admin');
            const data = await Admin.findById(this.admin);
            if (data) {
                this.name = data.name;
                this.image = data.Image; // Admin schema uses Capital 'I'
                this.role = data.role;
                this.status = data.status; // Admin uses lowercase 's'
                this.joinDate = data.joinDate;
            }
        }
        else if (this.isModified('superAdmin') || (this.isNew && this.superAdmin)) {
            const SuperAdmin = mongoose.model('SuperAdmin');
            const data = await SuperAdmin.findById(this.superAdmin);
            if (data) {
                this.name = data.name;
                this.image = data.Image; // SuperAdmin schema uses Capital 'I'
                this.role = data.role;
                this.status = data.status; // SuperAdmin uses lowercase 's'
                this.joinDate = data.joinDate;
            }
        }
    } catch (error) {
        throw error;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
