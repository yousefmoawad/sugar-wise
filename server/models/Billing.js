const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    cardholderName: {
        type: String,
        required: true,
    },
    cardNumber: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
    cvvCvc: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
