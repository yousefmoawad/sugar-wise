const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    promoCode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PromoCode',
        default: null
    },
    p_id: {
        type: Number,
        default: 0
    },
    name: {
        type: String, // from Product
        default: ""
    },
    image1: {
        type: String, // from Product
        default: ""
    },
    promoCodeName: {
        type: String, // from PromoCode
        default: ""
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
}, {
    timestamps: true
});

// Pre-save hook to pull data from Product and PromoCode
cartSchema.pre('save', async function () {
    if (this.isModified('product') || this.isNew) {
        const Product = mongoose.model('Product');
        const productData = await Product.findById(this.product);
        if (productData) {
            this.p_id = productData.p_id;
            this.name = productData.name;
            this.image1 = productData.image1;
        }
    }

    if (this.isModified('promoCode') || (this.isNew && this.promoCode)) {
        const PromoCode = mongoose.model('PromoCode');
        const promoCodeData = await PromoCode.findById(this.promoCode);
        if (promoCodeData) {
            this.promoCodeName = promoCodeData.promoCodeName;
        }
    }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
