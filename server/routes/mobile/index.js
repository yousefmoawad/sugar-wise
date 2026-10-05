const express = require('express');
const router = express.Router();

const authMobileRoutes = require('./authMobileRoutes');

// Reuse existing route handlers for mobile namespace.
const doctorRoutes = require('../doctorRoutes');
const patientRoutes = require('../patientRoutes');
const productRoutes = require('../productRoutes');
const cartRoutes = require('../cartRoutes');
const messagesRoutes = require('../MessagesRoutes');
const notificationRoutes = require('../NotificationRoutes');
const bookDoctorRoutes = require('../BookDoctorRoutes');
const diabetesMonitoringRoutes = require('../DiabetesMonitoringRoutes');
const labTestRoutes = require('../LabTestRoutes');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mobile API is running',
  });
});

router.use('/auth', authMobileRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bookings', bookDoctorRoutes);
router.use('/monitoring', diabetesMonitoringRoutes);
router.use('/lab-tests', labTestRoutes);

module.exports = router;
