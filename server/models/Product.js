const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    status:{
        type: String,
        enum: ["Available", "Out of Stock" , "Discontinued"],
        default: "Out of Stock"
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    category: [{
        type: String,
        enum: ["Glucose Meters", "Glucose Pens", "Insulin", "Diabetes Supplies"]
    }],
    ProfitMarkup: {
        type: Number,
        default: 0
    },
    p_id: {
        type: Number,
        unique: true 
    }
},
{
    timestamps: true
});

// --- AUTO-GENERATE P_ID LOGIC START ---
productSchema.pre('save', async function () {
    // Only generate a new p_id if this is a brand new product
    if (this.isNew) {
        // Look for the product with the highest p_id in the database
        const lastProduct = await mongoose.model('Product').findOne({}, 'p_id').sort({ p_id: -1 });

        if (lastProduct && lastProduct.p_id) {
            // If products exist, take the highest p_id and add 1
            this.p_id = lastProduct.p_id + 1;
        } else {
            // If the database is completely empty, start at 1
            this.p_id = 1;
        }
    }
});
// --- AUTO-GENERATE P_ID LOGIC END ---

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
