const mongoose = require('mongoose');

const verificationDoctorSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    fullName: {
        type: String,
        default: ""
    },
    medicalSpecialty: {
        type: String,
        default: ""
    },
    selfImg: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['accepted', 'pending', 'blocked', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

verificationDoctorSchema.pre('save', async function (next) {
    if (this.doctor && (this.isModified('doctor') || this.isNew)) {
        try {
            const Doctor = mongoose.model('Doctor');
            const doctorData = await Doctor.findById(this.doctor);
            if (doctorData) {
                this.fullName = `${doctorData.firstName} ${doctorData.lastName}`.trim();
                this.medicalSpecialty = doctorData.medicalSpecialty;
                this.selfImg = doctorData.selfImg;
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('VerificationDoctor', verificationDoctorSchema);
