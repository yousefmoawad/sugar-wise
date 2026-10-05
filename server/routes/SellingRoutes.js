const express = require('express');
const router = express.Router();
const {
    createSelling,
    getSellings,
    getSellingById,
    updateSelling,
    deleteSelling,
    getSellingStats
} = require('../controllers/SellingController');

// /api/selling/stats (Must be above /:id to prevent "stats" from being parsed as an ID)
router.route('/stats').get(getSellingStats);

// /api/selling
router.route('/').get(getSellings).post(createSelling);

// /api/selling/:id
router.route('/:id').get(getSellingById).put(updateSelling).delete(deleteSelling);

module.exports = router;
