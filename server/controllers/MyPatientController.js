const myPatientAPI = require('../services/api/myPatientAPI');

exports.createMyPatient = async (req, res) => {
    try {
        const myPatient = await myPatientAPI.create(req.body, req);
        res.status(201).json({
            success: true,
            data: myPatient,
            message: 'My patient record created successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.getMyPatients = async (req, res) => {
    try {
        const myPatients = await myPatientAPI.getAll(req);
        res.status(200).json({
            success: true,
            count: myPatients.length,
            data: myPatients,
            message: 'My patient records retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.getMyPatientById = async (req, res) => {
    try {
        const myPatient = await myPatientAPI.getById(req.params.id, req);
        res.status(200).json({
            success: true,
            data: myPatient,
            message: 'My patient record retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.updateMyPatient = async (req, res) => {
    try {
        const myPatient = await myPatientAPI.update(req.params.id, req.body, req);
        res.status(200).json({
            success: true,
            data: myPatient,
            message: 'My patient record updated successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.deleteMyPatient = async (req, res) => {
    try {
        await myPatientAPI.remove(req.params.id, req);
        res.status(200).json({
            success: true,
            data: {},
            message: 'My patient record deleted successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};
