const InsulinUnits = require('../models/InsulinUnits');

// @desc    Create an insulin unit entry
// @route   POST /api/insulinunits
// @access  Public/Private
const createInsulinUnit = async (req, res) => {
    try {
        const insulinUnit = await InsulinUnits.create(req.body);
        res.status(201).json({ success: true, data: insulinUnit });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all insulin units
// @route   GET /api/insulinunits
// @access  Public/Private
const getInsulinUnits = async (req, res) => {
    try {
        const insulinUnits = await InsulinUnits.find({});
        res.status(200).json({ success: true, count: insulinUnits.length, data: insulinUnits });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single insulin unit
// @route   GET /api/insulinunits/:id
// @access  Public/Private
const getInsulinUnitById = async (req, res) => {
    try {
        const insulinUnit = await InsulinUnits.findById(req.params.id);

        if (!insulinUnit) {
            return res.status(404).json({ success: false, error: 'Insulin unit not found' });
        }

        res.status(200).json({ success: true, data: insulinUnit });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update an insulin unit
// @route   PUT /api/insulinunits/:id
// @access  Public/Private
const updateInsulinUnit = async (req, res) => {
    try {
        const insulinUnit = await InsulinUnits.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!insulinUnit) {
            return res.status(404).json({ success: false, error: 'Insulin unit not found' });
        }

        res.status(200).json({ success: true, data: insulinUnit });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete an insulin unit
// @route   DELETE /api/insulinunits/:id
// @access  Public/Private
const deleteInsulinUnit = async (req, res) => {
    try {
        const insulinUnit = await InsulinUnits.findByIdAndDelete(req.params.id);

        if (!insulinUnit) {
            return res.status(404).json({ success: false, error: 'Insulin unit not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createInsulinUnit,
    getInsulinUnits,
    getInsulinUnitById,
    updateInsulinUnit,
    deleteInsulinUnit
};
