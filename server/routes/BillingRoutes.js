const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');
const billingController = require('../controllers/BillingController');

router.use(optionalAuthenticateToken);

// Route to create a new billing record
router.post('/', billingController.createBilling);

// Route to get all billing records
router.get('/', billingController.getAllBillings);

// Route to get a specific billing record by ID
router.get('/:id', billingController.getBillingById);

// Route to update a specific billing record by ID
router.put('/:id', billingController.updateBilling);

// Route to delete a specific billing record by ID
router.delete('/:id', billingController.deleteBilling);

module.exports = router;
