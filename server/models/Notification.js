const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: { type: String, default: 'system', trim: true },
    relatedChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
      index: true,
    },
    actionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger'],
      default: 'info',
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
