const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    image1: {
        type: String,
        default: ""
    },
    image2: {
        type: String,
        default: ""
    },
    image3: {
        type: String,
        default: ""
    },
    image4: {
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
    description: {
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
productViewSchema.pre('save', async function (next) {
    if (this.isModified('product') || this.isNew) {
        try {
            const Product = mongoose.model('Product');
            const productData = await Product.findById(this.product);

            if (productData) {
                this.name = productData.name;
                this.price = productData.price;
                this.description = productData.description;
                this.image1 = productData.image1;
                this.image2 = productData.image2;
                this.image3 = productData.image3;
                this.image4 = productData.image4;
                this.rate = productData.rate;

                // Product category is an array, take the first one
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

const ProductView = mongoose.model('ProductView', productViewSchema);

module.exports = ProductView;
