const diabetesMonitoringAPI = require('../services/api/diabetesMonitoringAPI');
const Patient = require('../models/Patient');
const { ensurePatientProfileLinked } = require('../utils/ensurePatientLink');
const { notifyDoctorsAboutMonitoring } = require('../services/patientAlertService');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

async function resolvePatientAccess(authUser) {
    const role = normalizeRole(authUser?.role);
    const isElevated = role === 'admin' || role === 'super admin' || role === 'superadmin';
    let patientId = authUser?.patient || null;

    if (role === 'patient' && !patientId && authUser?._id) {
        const linked = await ensurePatientProfileLinked(authUser._id, {
            email: authUser.email,
            name: authUser.name,
        }).catch(() => null);
        patientId = linked?.patient || patientId;
    }

    if (role === 'patient') {
        if (!patientId) {
            const err = new Error('Patient profile is not linked to this account');
            err.statusCode = 403;
            throw err;
        }
        return { role, patientId, isElevated: false };
    }

    return { role, patientId, isElevated };
}

exports.createDiabetesMonitoring = async (req, res) => {
    try {
        const access = await resolvePatientAccess(req.authUser);
        const payload = { ...req.body };

        if (access.role === 'patient') {
            payload.patient = access.patientId;
        } else if (!access.isElevated) {
            const err = new Error('Only patients or administrators can create diabetes monitoring records');
            err.statusCode = 403;
            throw err;
        }

        const monitoring = await diabetesMonitoringAPI.create(payload);
        if (access.role === 'patient') {
            await notifyDoctorsAboutMonitoring(monitoring).catch((error) => {
                console.error('Failed to notify doctors about diabetes monitoring:', error.message);
            });
        }
        res.status(201).json({
            success: true,
            data: monitoring,
            message: 'Diabetes monitoring record created successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.getDiabetesMonitorings = async (req, res) => {
    try {
        const access = await resolvePatientAccess(req.authUser);
        const filter =
            access.role === 'patient'
                ? { patient: access.patientId }
                : access.role === 'doctor' && req.query.patientId
                  ? { patient: req.query.patientId }
                  : {};
        const monitorings = await diabetesMonitoringAPI.getAll(filter);
        res.status(200).json({
            success: true,
            count: monitorings.length,
            data: monitorings,
            message: 'Diabetes monitoring records retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.getDiabetesMonitoringById = async (req, res) => {
    try {
        const access = await resolvePatientAccess(req.authUser);
        const monitoring = await diabetesMonitoringAPI.getById(req.params.id);
        if (access.role === 'patient' && String(monitoring.patient || '') !== String(access.patientId)) {
            return res.status(403).json({ success: false, error: 'You do not have access to this record' });
        }
        res.status(200).json({
            success: true,
            data: monitoring,
            message: 'Diabetes monitoring record retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.updateDiabetesMonitoring = async (req, res) => {
    try {
        const access = await resolvePatientAccess(req.authUser);
        const existing = await diabetesMonitoringAPI.getById(req.params.id);
        if (access.role === 'patient' && String(existing.patient || '') !== String(access.patientId)) {
            return res.status(403).json({ success: false, error: 'You do not have access to this record' });
        }

        const payload = { ...req.body };
        if (access.role === 'patient') {
            payload.patient = access.patientId;
        }

        const monitoring = await diabetesMonitoringAPI.update(req.params.id, payload);
        if (access.role === 'patient') {
            await notifyDoctorsAboutMonitoring(monitoring).catch((error) => {
                console.error('Failed to notify doctors about updated diabetes monitoring:', error.message);
            });
        }
        res.status(200).json({
            success: true,
            data: monitoring,
            message: 'Diabetes monitoring record updated successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.deleteDiabetesMonitoring = async (req, res) => {
    try {
        const access = await resolvePatientAccess(req.authUser);
        const existing = await diabetesMonitoringAPI.getById(req.params.id);
        if (access.role === 'patient' && String(existing.patient || '') !== String(access.patientId)) {
            return res.status(403).json({ success: false, error: 'You do not have access to this record' });
        }
        await diabetesMonitoringAPI.remove(req.params.id);
        res.status(200).json({
            success: true,
            data: {},
            message: 'Diabetes monitoring record deleted successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};
