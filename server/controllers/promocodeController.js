const PromoCode = require('../models/PromoCode');

// @desc    Create a promo code
// @route   POST /api/promocodes
// @access  Public/Private
const createPromoCode = async (req, res) => {
    try {
        const { product } = req.body;

        // Optional: Check if product exists before saving
        if (product) {
            const Product = require('../models/Product');
            const existingProduct = await Product.findById(product);
            if (!existingProduct) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }
        }

        const promoCode = await PromoCode.create(req.body);
        res.status(201).json({ success: true, data: promoCode });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all promo codes
// @route   GET /api/promocodes
// @access  Public/Private
const getPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find({});
        res.status(200).json({ success: true, count: promoCodes.length, data: promoCodes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single promo code
// @route   GET /api/promocodes/:id
// @access  Public/Private
const getPromoCodeById = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ success: false, error: 'Promo code not found' });
        }

        res.status(200).json({ success: true, data: promoCode });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update a promo code
// @route   PUT /api/promocodes/:id
// @access  Public/Private
const updatePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!promoCode) {
            return res.status(404).json({ success: false, error: 'Promo code not found' });
        }

        res.status(200).json({ success: true, data: promoCode });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a promo code
// @route   DELETE /api/promocodes/:id
// @access  Public/Private
const deletePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ success: false, error: 'Promo code not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Validate a promo code
// @route   POST /api/promocodes/validate
// @access  Public
const validatePromoCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                isValid: false,
                error: 'Promo code is required'
            });
        }

        const promoCode = await PromoCode.findOne({ code });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                isValid: false,
                error: 'Promo code not found'
            });
        }

        // Check if promo code is active and not expired
        const now = new Date();
        if (promoCode.expiryDate && new Date(promoCode.expiryDate) < now) {
            return res.status(400).json({
                success: false,
                isValid: false,
                error: 'Promo code has expired'
            });
        }

        if (!promoCode.active) {
            return res.status(400).json({
                success: false,
                isValid: false,
                error: 'Promo code is not active'
            });
        }

        res.status(200).json({
            success: true,
            isValid: true,
            data: {
                code: promoCode.code,
                discount: promoCode.discount,
                discountType: promoCode.discountType, // 'percentage' or 'fixed'
                maxUses: promoCode.maxUses,
                usedCount: promoCode.usedCount || 0
            },
            message: 'Promo code is valid'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            isValid: false,
            error: error.message
        });
    }
};

// @desc    Apply a promo code
// @route   POST /api/promocodes/apply
// @access  Public
const applyPromoCode = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Promo code is required'
            });
        }

        const promoCode = await PromoCode.findOne({ code });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                error: 'Promo code not found'
            });
        }

        // Check if promo code is active and not expired
        const now = new Date();
        if (promoCode.expiryDate && new Date(promoCode.expiryDate) < now) {
            return res.status(400).json({
                success: false,
                error: 'Promo code has expired'
            });
        }

        if (!promoCode.active) {
            return res.status(400).json({
                success: false,
                error: 'Promo code is not active'
            });
        }

        // Check max uses
        if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
            return res.status(400).json({
                success: false,
                error: 'Promo code usage limit exceeded'
            });
        }

        // Calculate discount
        let discount = 0;
        if (promoCode.discountType === 'percentage') {
            discount = (cartTotal * promoCode.discount) / 100;
        } else {
            discount = promoCode.discount;
        }

        // Increment used count
        promoCode.usedCount = (promoCode.usedCount || 0) + 1;
        await promoCode.save();

        res.status(200).json({
            success: true,
            data: {
                code: promoCode.code,
                discount,
                discountType: promoCode.discountType,
                newTotal: Math.max(0, cartTotal - discount)
            },
            message: 'Promo code applied successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createPromoCode,
    getPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    applyPromoCode
};
