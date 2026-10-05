const Admin = require('../models/Admin');

// @desc    Create an admin
// @route   POST /api/admins
// @access  Private/Admin
const createAdmin = async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        const adminObject = admin.toObject ? admin.toObject() : admin;
        delete adminObject.password;
        res.status(200).json({ success: true, data: adminObject });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/Admin
const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password');
        res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single admin
// @route   GET /api/admins/:id
// @access  Private/Admin
const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');

        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update an admin
// @route   PUT /api/admins/:id
// @access  Private/Admin
const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            select: '-password',
        });

        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete an admin
// @route   DELETE /api/admins/:id
// @access  Private/Admin
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
};
