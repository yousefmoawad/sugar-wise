const ContactUs = require('../models/ContactUs');

// Create a new contact message
exports.createContactMessage = async (req, res) => {
    try {
        const { fullName, phoneNumber, subject, contactMethods, message } = req.body;

        const newMessage = new ContactUs({
            fullName,
            phoneNumber,
            subject,
            contactMethods,
            message
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact message', error: error.message });
    }
};

// Get all contact messages
exports.getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactUs.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact messages', error: error.message });
    }
};

// Get a specific contact message by ID
exports.getContactMessageById = async (req, res) => {
    try {
        const message = await ContactUs.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact message', error: error.message });
    }
};

// Update a contact message status or details
exports.updateContactMessage = async (req, res) => {
    try {
        const updatedMessage = await ContactUs.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact message', error: error.message });
    }
};

// Delete a contact message
exports.deleteContactMessage = async (req, res) => {
    try {
        const deletedMessage = await ContactUs.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Contact message not found' });
        }
        res.status(200).json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact message', error: error.message });
    }
};
