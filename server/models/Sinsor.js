const mongoose = require('mongoose');

const sinsorSchema = new mongoose.Schema({
    Patient_Id: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Gloucose: {
        type: Number,
        required: true,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now
    },
    Time: {
        type: String,
        required: true,
        default: () => {
            const now = new Date();
            return `${now.getHours()}:${now.getMinutes()}`;
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Sinsor', sinsorSchema);
