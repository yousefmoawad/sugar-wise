const Shop = require('../models/Shop');
const Product = require('../models/Product');

// @desc    Add a product to the shop
// @route   POST /api/shop
// @access  Public/Private
const createShopItem = async (req, res) => {
    try {
        const { product } = req.body;

        // Check if product exists
        const existingProduct = await Product.findById(product);
        if (!existingProduct) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Create shop entry. The pre-save hook in Shop.js will pull the rest of the data.
        const shopItem = new Shop({ product });
        await shopItem.save();

        res.status(201).json({ success: true, data: shopItem });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all shop items
// @route   GET /api/shop
// @access  Public
const getShopItems = async (req, res) => {
    try {
        const shopItems = await Shop.find({}).populate('product');
        res.status(200).json({ success: true, count: shopItems.length, data: shopItems });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single shop item
// @route   GET /api/shop/:id
// @access  Public
const getShopItemById = async (req, res) => {
    try {
        const shopItem = await Shop.findById(req.params.id).populate('product');

        if (!shopItem) {
            return res.status(404).json({ success: false, error: 'Shop item not found' });
        }

        res.status(200).json({ success: true, data: shopItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a shop item
// @route   DELETE /api/shop/:id
// @access  Public/Private
const deleteShopItem = async (req, res) => {
    try {
        const shopItem = await Shop.findByIdAndDelete(req.params.id);

        if (!shopItem) {
            return res.status(404).json({ success: false, error: 'Shop item not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createShopItem,
    getShopItems,
    getShopItemById,
    deleteShopItem
};
