const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    createDietlySystem,
    getDietlySystems,
    getDietlySystemById,
    updateDietlySystem,
    deleteDietlySystem
} = require('../controllers/DietlySystemController');

router.use(authenticateToken);

// /api/dietly-system
router.route('/').get(getDietlySystems).post(createDietlySystem);

// /api/dietly-system/:id
router.route('/:id').get(getDietlySystemById).put(updateDietlySystem).delete(deleteDietlySystem);

module.exports = router;
