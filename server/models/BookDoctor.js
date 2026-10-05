const mongoose = require('mongoose');

const bookDoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    clinicName: {
      type: String,
      required: true,
      trim: true,
    },
    clinicAddress: {
      type: String,
      default: '',
      trim: true,
    },
    appointmentDate: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentTime: {
      type: String,
      required: true,
      trim: true,
    },
    fees: {
      type: Number,
      default: 0,
    },
    patientName: {
      type: String,
      default: '',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('BookDoctor', bookDoctorSchema);
