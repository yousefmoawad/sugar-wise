const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
    createClinic,
    getClinics,
    getClinicById,
    updateClinic,
    deleteClinic
} = require('../controllers/MyClinicController');

router.use(optionalAuthenticateToken);

// /api/myclinic
router.route('/').get(getClinics).post(createClinic);

// /api/myclinic/:id
router.route('/:id').get(getClinicById).put(updateClinic).delete(deleteClinic);

module.exports = router;
