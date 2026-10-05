const express = require('express');
const router = express.Router();
const {
    createVerification,
    getVerifications,
    getVerificationById,
    updateVerification,
    deleteVerification
} = require('../controllers/VerificationDoctorController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const onlyAdmin = [authenticateToken, authorizeRole(['Admin', 'Super Admin'])];

// /api/verification-doctor
router.route('/')
    .get(...onlyAdmin, getVerifications)
    .post(createVerification);

// /api/verification-doctor/:id
router.route('/:id')
    .get(...onlyAdmin, getVerificationById)
    .put(...onlyAdmin, updateVerification)
    .delete(...onlyAdmin, deleteVerification);

module.exports = router;
