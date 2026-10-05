const express = require('express');
const router = express.Router();
const {
    createPromoCode,
    getPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    validatePromoCode,
    applyPromoCode
} = require('../controllers/promocodeController');

router.route('/')
    .get(getPromoCodes)
    .post(createPromoCode);

// /api/promocodes/validate - Validate a promo code
router.post('/validate', validatePromoCode);

// /api/promocodes/apply - Apply a promo code
router.post('/apply', applyPromoCode);

router.route('/:id')
    .get(getPromoCodeById)
    .put(updatePromoCode)
    .delete(deletePromoCode);

module.exports = router;
