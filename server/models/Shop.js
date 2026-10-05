const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    image1: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: ""
    },
    rate: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Pre-save hook to automatically pull data from the Product table
shopSchema.pre('save', async function (next) {
    if (this.isModified('product') || this.isNew) {
        try {
            const Product = mongoose.model('Product');
            const productData = await Product.findById(this.product);

            if (productData) {
                this.name = productData.name;
                this.price = productData.price;
                this.image = productData.image1; // Pulling the first image from product
                this.rate = productData.rate;

                // Product category is an array, we'll take the first one or join them
                if (productData.category && productData.category.length > 0) {
                    this.category = productData.category[0];
                }
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
