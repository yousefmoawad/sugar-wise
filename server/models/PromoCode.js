const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    promoCodeName: {
        type: String,
        required: [true, 'Promo code name is required'],
        trim: true,
        unique: true
    },
    discountTypeArray: {
        type: String,
        enum: ["Percentage", "Fixed Amount"],
        required: [true, 'Discount type is required']
    },
    value: {
        type: Number,
        required: [true, 'Discount value is required'],
        default: 0
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    applyProduct: {
        image: {
            type: String,
            default: ""
        },
        productName: {
            type: String,
            default: ""
        }
    },
    state: {
        type: String,
        enum: ["Active", "Expired", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true
});

// Pre-save hook to automatically pull data from the Product table
promoCodeSchema.pre('save', async function (next) {
    if (this.isModified('product') || this.isNew) {
        try {
            const Product = mongoose.model('Product');
            const productData = await Product.findById(this.product);

            if (productData) {
                // Populate the applyProduct object with data from the product
                this.applyProduct.productName = productData.name;
                this.applyProduct.image = productData.image1;
                this.applyProduct.p_id = productData.p_id;
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;
