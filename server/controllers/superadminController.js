const SuperAdmin = require('../models/SuperAdmin');

// @desc    Create a super admin
// @route   POST /api/superadmins
// @access  Private/SuperAdmin
const createSuperAdmin = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.create(req.body);
        res.status(201).json({ success: true, data: superAdmin });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all super admins
// @route   GET /api/superadmins
// @access  Private/SuperAdmin
const getSuperAdmins = async (req, res) => {
    try {
        const superAdmins = await SuperAdmin.find({});
        res.status(200).json({ success: true, count: superAdmins.length, data: superAdmins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single super admin
// @route   GET /api/superadmins/:id
// @access  Private/SuperAdmin
const getSuperAdminById = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findById(req.params.id);

        if (!superAdmin) {
            return res.status(404).json({ success: false, error: 'Super Admin not found' });
        }

        res.status(200).json({ success: true, data: superAdmin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update a super admin
// @route   PUT /api/superadmins/:id
// @access  Private/SuperAdmin
const updateSuperAdmin = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!superAdmin) {
            return res.status(404).json({ success: false, error: 'Super Admin not found' });
        }

        res.status(200).json({ success: true, data: superAdmin });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a super admin
// @route   DELETE /api/superadmins/:id
// @access  Private/SuperAdmin
const deleteSuperAdmin = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findByIdAndDelete(req.params.id);

        if (!superAdmin) {
            return res.status(404).json({ success: false, error: 'Super Admin not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createSuperAdmin,
    getSuperAdmins,
    getSuperAdminById,
    updateSuperAdmin,
    deleteSuperAdmin
};
