const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    chatName: {
        type: String,
        default: ""
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    lastMessageTime: {
        type: Date,
        default: null
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    hiddenFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]
}, {
    timestamps: true
});

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
