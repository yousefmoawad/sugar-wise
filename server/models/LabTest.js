const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'image', 'pdf'],
      default: 'text',
    },
    fileUrl: { type: String, default: null }, // Stores path to PDF, Image, etc.
    notes: { type: String, default: '', trim: true },
    resultStatus: {
      type: String,
      enum: ['High', 'Low', 'Normal', 'Unknown'],
      default: 'Unknown',
      trim: true,
    },
    Patient_Id: {
      type: String,
      default: '',
      trim: true,
    },
    Name: {
      type: String,
      default: '',
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Optional, in case the test isn't linked to a specific product
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
