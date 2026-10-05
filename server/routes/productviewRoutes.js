const express = require('express');
const router = express.Router();
const {
    createProductView,
    getProductViews,
    getProductViewById,
    deleteProductView
} = require('../controllers/productviewController');

router.route('/')
    .get(getProductViews)
    .post(createProductView);

router.route('/:id')
    .get(getProductViewById)
    .delete(deleteProductView);

module.exports = router;
