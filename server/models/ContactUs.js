const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        enum: [
            'General Inquiry',
            'Technical Support',
            'Product Information',
            'Partnership Opportunities',
            'Media & Press',
            'Feedback & Suggestions',
            'Emergency Assistance'
        ],
        required: true
    },
    contactMethods: [{
        type: String,
        enum: ['Email', 'Phone call', 'SMS/Text']
    }],
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactUs', contactUsSchema);
