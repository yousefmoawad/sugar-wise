const ProductView = require('../models/ProductView');
const Product = require('../models/Product');

// @desc    Add a product view entry
// @route   POST /api/productview
// @access  Public/Private
const createProductView = async (req, res) => {
    try {
        const { product } = req.body;

        // Check if product exists
        const existingProduct = await Product.findById(product);
        if (!existingProduct) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Create productView entry. The pre-save hook will pull the rest of the data.
        const productView = new ProductView({ product });
        await productView.save();

        res.status(201).json({ success: true, data: productView });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all product views
// @route   GET /api/productview
// @access  Public
const getProductViews = async (req, res) => {
    try {
        const productViews = await ProductView.find({}).populate('product');
        res.status(200).json({ success: true, count: productViews.length, data: productViews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single product view
// @route   GET /api/productview/:id
// @access  Public
const getProductViewById = async (req, res) => {
    try {
        const productView = await ProductView.findById(req.params.id).populate('product');

        if (!productView) {
            return res.status(404).json({ success: false, error: 'Product view not found' });
        }

        res.status(200).json({ success: true, data: productView });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a product view
// @route   DELETE /api/productview/:id
// @access  Public/Private
const deleteProductView = async (req, res) => {
    try {
        const productView = await ProductView.findByIdAndDelete(req.params.id);

        if (!productView) {
            return res.status(404).json({ success: false, error: 'Product view not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createProductView,
    getProductViews,
    getProductViewById,
    deleteProductView
};
