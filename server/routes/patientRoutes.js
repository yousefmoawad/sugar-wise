const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
    createPatient,
    getPatients,
    getPatientById,
    getMyPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    updateMyLocation
} = require('../controllers/patientController');

// /api/patients/search
router.get('/search', authenticateToken, authorizeRole(['Admin', 'Super Admin']), searchPatients);

router.get('/me', authenticateToken, getMyPatient);
router.put('/me/location', authenticateToken, updateMyLocation);

// /api/patients
router.route('/')
    .get(authenticateToken, authorizeRole(['Admin', 'Super Admin']), getPatients)
    .post(optionalAuthenticateToken, createPatient);

// /api/patients/:id
router.route('/:id')
    .get(authenticateToken, getPatientById)
    .put(authenticateToken, updatePatient)
    .delete(authenticateToken, authorizeRole(['Admin', 'Super Admin']), deletePatient);

module.exports = router;
