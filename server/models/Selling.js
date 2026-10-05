const mongoose = require('mongoose');

const sellingSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    paymentMethod: {
        type: String,
        default: ""
    },
    fullName: {
        type: String,
        default: ""
    },
    orderId: {
        type: String,
        default: ""
    },
    Date: {
        type: Date
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Arrived', 'on the Way', 'Not yet shipping'],
        default: 'Not yet shipping'
    }
}, { timestamps: true });

// Pre-save hook to automatically pull data from Payment and Product
sellingSchema.pre('save', async function (next) {
    // Sync with Payment
    if (this.payment && (this.isModified('payment') || this.isNew)) {
        try {
            const Payment = mongoose.model('Payment');
            const paymentData = await Payment.findById(this.payment);
            if (paymentData) {
                this.paymentMethod = paymentData.paymentMethod;
                this.fullName = paymentData.fullName;
                this.orderId = paymentData.orderId;
                this.Date = paymentData.Date;

                // Grab the product ID from the payment directly
                if (paymentData.product && !this.product) {
                    this.product = paymentData.product;
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    // Sync with Product
    if (this.product && (this.isModified('product') || this.isNew)) {
        try {
            const Product = mongoose.model('Product');
            const productData = await Product.findById(this.product);
            if (productData) {
                this.name = productData.name;
                this.price = productData.price;
            }
        } catch (error) {
            return next(error);
        }
    }

    next();
});

// Calculate metrics individually across the selling collection. 
sellingSchema.statics.getDashboardStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                AllPrice: { $sum: "$price" },
                AllTransit: { $sum: { $cond: [{ $eq: ["$status", "Arrived"] }, 1, 0] } },
                "All product": { $sum: 1 },
                Pending: { $sum: { $cond: [{ $eq: ["$status", "on the Way"] }, 1, 0] } }
            }
        }
    ]);
    // Removes the _id from the returned item and sets default fallbacks
    return stats.length > 0
        ? { AllPrice: stats[0].AllPrice, AllTransit: stats[0].AllTransit, 'All product': stats[0]['All product'], Pending: stats[0].Pending }
        : { AllPrice: 0, AllTransit: 0, 'All product': 0, Pending: 0 };
};

module.exports = mongoose.model('Selling', sellingSchema);
