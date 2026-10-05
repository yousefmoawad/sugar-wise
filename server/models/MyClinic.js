const mongoose = require('mongoose');

const myClinicSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    hours: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    price: { type: String, default: '', trim: true },
    position: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model('MyClinic', myClinicSchema);
