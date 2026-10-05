const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    createLabTest,
    getLabTests,
    getLabTestById,
    updateLabTest,
    deleteLabTest
} = require('../controllers/LabTestController');

router.use(authenticateToken);

// /api/lab-test
router.route('/').get(getLabTests).post(createLabTest);

// /api/lab-test/:id
router.route('/:id').get(getLabTestById).put(updateLabTest).delete(deleteLabTest);

module.exports = router;
