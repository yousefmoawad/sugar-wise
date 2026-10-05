const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    createDiabetesMonitoring,
    getDiabetesMonitorings,
    getDiabetesMonitoringById,
    updateDiabetesMonitoring,
    deleteDiabetesMonitoring
} = require('../controllers/DiabetesMonitoringController');

// /api/diabetes-monitoring
router.use(authenticateToken);
router.route('/').get(getDiabetesMonitorings).post(createDiabetesMonitoring);

// /api/diabetes-monitoring/:id
router.route('/:id').get(getDiabetesMonitoringById).put(updateDiabetesMonitoring).delete(deleteDiabetesMonitoring);

module.exports = router;
