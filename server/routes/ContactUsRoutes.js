const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/ContactUsController');

// Route to create a new contact message
router.post('/', contactUsController.createContactMessage);

// Route to get all contact messages
router.get('/', contactUsController.getAllContactMessages);

// Route to get a specific contact message by ID
router.get('/:id', contactUsController.getContactMessageById);

// Route to update a specific contact message by ID
router.put('/:id', contactUsController.updateContactMessage);

// Route to delete a specific contact message by ID
router.delete('/:id', contactUsController.deleteContactMessage);

module.exports = router;
