const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        default: ""
    },
    messageText: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'notification'],
        default: 'text'
    },
    fileUrl: {
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    expiredAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
