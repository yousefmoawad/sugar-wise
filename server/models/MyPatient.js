const mongoose = require('mongoose');

const myPatientSchema = new mongoose.Schema(
  {
    doctorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
      index: true,
    },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    patientProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    image: { type: String, default: '', trim: true },
    age: { type: Number, default: 0, min: 0 },
    lastTest: { type: String, default: '', trim: true },
    insulin: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Normal', 'High', 'Critical'],
      default: 'Normal',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MyPatient', myPatientSchema);
