const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
    createCartItem,
    getCartItems,
    getCartItemById,
    updateCartItem,
    deleteCartItem
} = require('../controllers/cartController');

router.use(optionalAuthenticateToken);

router.route('/')
    .get(getCartItems)
    .post(createCartItem);

router.route('/:id')
    .get(getCartItemById)
    .put(updateCartItem)
    .delete(deleteCartItem);

module.exports = router;
