const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Visa', 'Wallet', 'Cash'],
        required: true
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    fullName: {
        type: String,
        trim: true
    },
    telephoneNumber: {
        type: String,
        required: true
    },
    secondNumber: {
        type: String
    },
    shippingAddress: {
        type: String,
        required: true
    },
    walletNumber: {
        type: String
    },
    billingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Billing'
    },
    orderId: {
        type: String,
        unique: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    image1: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Pre-save hook to combine FName and LName into fullName and trim, and generate orderId
paymentSchema.pre('save', async function () {
    if (this.firstName && this.lastName) {
        this.fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
    }

    if (this.product && (this.isModified('product') || this.isNew)) {
        const Product = mongoose.model('Product');
        const productData = await Product.findById(this.product);
        if (productData) {
            this.image1 = productData.image1;
            this.name = productData.name;
            this.price = productData.price;
        }
    }

    if (this.isNew) {
        try {
            // Find the highest existing orderId
            const lastPayment = await this.constructor.findOne({}, 'orderId').sort({ orderId: -1 });
            let nextIdNumber = 1;

            if (lastPayment && lastPayment.orderId && lastPayment.orderId.startsWith('#ORD_')) {
                const lastIdString = lastPayment.orderId.replace('#ORD_', '');
                const lastIdNumber = parseInt(lastIdString, 10);
                if (!isNaN(lastIdNumber)) {
                    nextIdNumber = lastIdNumber + 1;
                }
            }

            const formattedNumber = nextIdNumber.toString().padStart(5, '0');
            this.orderId = `#ORD_${formattedNumber}`;
        } catch (err) {
            throw err;
        }
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
