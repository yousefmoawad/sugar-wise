const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken, authenticateToken } = require('../middleware/authMiddleware');
const {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorMeta,
    searchDoctors,
    followDoctor,
    rateDoctor,
} = require('../controllers/doctorController');

router.use(optionalAuthenticateToken);

// GET /api/doctors/meta  — returns universities & specialties lists
router.get('/meta', getDoctorMeta);

// GET /api/doctors/search — search doctors
router.get('/search', searchDoctors);

router.post('/:id/follow', authenticateToken, followDoctor);
router.post('/:id/rate', authenticateToken, rateDoctor);

// /api/doctors
router.route('/').get(getDoctors).post(createDoctor);

// /api/doctors/:id
router.route('/:id').get(getDoctorById).put(updateDoctor).delete(deleteDoctor);

module.exports = router;
