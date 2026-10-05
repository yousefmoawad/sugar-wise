const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const onlyAdmin = [authenticateToken, authorizeRole(['Admin', 'Super Admin'])];

router.get('/search', searchProducts);

router.route('/')
    .get(getProducts)
    .post(...onlyAdmin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(...onlyAdmin, updateProduct)
    .delete(...onlyAdmin, deleteProduct);

module.exports = router;
