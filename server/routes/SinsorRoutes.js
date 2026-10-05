const express = require('express');
const router = express.Router();
const {
    createSinsor,
    getSinsors,
    getSinsorById,
    updateSinsor,
    deleteSinsor
} = require('../controllers/SinsorController');

// /api/sinsors
router.route('/').get(getSinsors).post(createSinsor);

// /api/sinsors/:id
router.route('/:id').get(getSinsorById).put(updateSinsor).delete(deleteSinsor);

module.exports = router;
