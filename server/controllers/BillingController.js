const Billing = require('../models/Billing');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const isStaff = (role) => {
    const r = normalizeRole(role);
    return r === 'admin' || r === 'super admin' || r === 'superadmin' || r === 'subadmin';
};

const sameUser = (doc, req) => doc && req.authUser?._id && String(doc.userId) === String(req.authUser._id);

// Create new billing
exports.createBilling = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { cardholderName, cardNumber, expiryDate, cvvCvc } = req.body;

        const newBilling = new Billing({
            userId: req.authUser._id,
            cardholderName,
            cardNumber,
            expiryDate,
            cvvCvc,
        });

        const savedBilling = await newBilling.save();
        res.status(201).json({ success: true, data: savedBilling });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating billing', error: error.message });
    }
};

// Get all billings (scoped to user)
exports.getAllBillings = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const filter = isStaff(req.authUser.role) ? {} : { userId: req.authUser._id };
        const billings = await Billing.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: billings.length, data: billings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching billings', error: error.message });
    }
};

// Get billing by ID
exports.getBillingById = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const billing = await Billing.findById(req.params.id);
        if (!billing) {
            return res.status(404).json({ success: false, message: 'Billing not found' });
        }
        if (!isStaff(req.authUser.role) && !sameUser(billing, req)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        res.status(200).json({ success: true, data: billing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching billing', error: error.message });
    }
};

// Update billing
exports.updateBilling = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const billing = await Billing.findById(req.params.id);
        if (!billing) {
            return res.status(404).json({ success: false, message: 'Billing not found' });
        }
        if (!isStaff(req.authUser.role) && !sameUser(billing, req)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { cardholderName, cardNumber, expiryDate, cvvCvc } = req.body;

        const updatedBilling = await Billing.findByIdAndUpdate(
            req.params.id,
            { cardholderName, cardNumber, expiryDate, cvvCvc },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedBilling });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating billing', error: error.message });
    }
};

// Delete billing
exports.deleteBilling = async (req, res) => {
    try {
        if (!req.authUser?._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const billing = await Billing.findById(req.params.id);
        if (!billing) {
            return res.status(404).json({ success: false, message: 'Billing not found' });
        }
        if (!isStaff(req.authUser.role) && !sameUser(billing, req)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        await Billing.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Billing deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting billing', error: error.message });
    }
};
