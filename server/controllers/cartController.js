const cartAPI = require('../services/api/cartAPI');

const assertCartOwner = (cartItem, userId) =>
  cartItem && userId && String(cartItem.userId) === String(userId);

// @desc    Add item to cart
// @route   POST /api/cart
const createCartItem = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const body = { ...req.body, userId: req.authUser._id };
        const cartItem = await cartAPI.createCartItem(body);
        res.status(201).json({ success: true, data: cartItem });
    } catch (error) {
        res.status(error.statusCode || 400).json({ success: false, error: error.message });
    }
};

// @desc    Get all cart items for current user
// @route   GET /api/cart
const getCartItems = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const cartItems = await cartAPI.getCartItems({ userId: req.authUser._id });
        res.status(200).json({ success: true, count: cartItems.length, data: cartItems });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
};

// @desc    Get single cart item
// @route   GET /api/cart/:id
const getCartItemById = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const cartItem = await cartAPI.getCartItemById(req.params.id);
        if (!assertCartOwner(cartItem, req.authUser._id)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        res.status(200).json({ success: true, data: cartItem });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
};

// @desc    Update a cart item
// @route   PUT /api/cart/:id
const updateCartItem = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const existing = await cartAPI.getCartItemById(req.params.id);
        if (!assertCartOwner(existing, req.authUser._id)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const cartItem = await cartAPI.updateCartItem(req.params.id, req.body);
        res.status(200).json({ success: true, data: cartItem });
    } catch (error) {
        res.status(error.statusCode || 400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a cart item
// @route   DELETE /api/cart/:id
const deleteCartItem = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const existing = await cartAPI.getCartItemById(req.params.id);
        if (!assertCartOwner(existing, req.authUser._id)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        await cartAPI.deleteCartItem(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createCartItem,
    getCartItems,
    getCartItemById,
    updateCartItem,
    deleteCartItem
};
