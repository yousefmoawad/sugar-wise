const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { ensurePatientProfileLinked } = require('../utils/ensurePatientLink');
const { isDataUrl, saveDataUrlFile } = require('../utils/fileStorage');
const sanitizePatient = (doc) => {
    const patient = doc.toObject ? doc.toObject() : doc;
    if (patient) delete patient.password;
    return patient;
};

const normalizeGender = (value) => {
    const v = String(value || '').trim().toLowerCase();
    if (v === 'male') return 'Male';
    if (v === 'female') return 'Female';
    return value;
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// Helper function to send notifications to users
const notifyUsers = async (notifications = []) => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    await Promise.all(
        notifications
            .filter((entry) => entry?.user)
            .map((entry) =>
                Notification.create({
                    user: entry.user,
                    type: entry.type || 'system',
                    title: entry.title,
                    message: entry.message,
                    actionUrl: entry.actionUrl || '',
                    isRead: false,
                }).catch(() => null)
            )
    );
};

// Helper function to notify all admins and super admins
const notifyAdminAndSuperAdminUsers = async (notification) => {
    const staffUsers = await User.find({
        role: { $in: ['Admin', 'Super Admin'] },
    })
        .select('_id')
        .lean()
        .catch(() => []);

    if (!staffUsers.length) return;

    await notifyUsers(
        staffUsers.map((user) => ({
            user: user._id,
            ...notification,
        }))
    );
};

const getRequestAccess = (req) => {
    const role = normalizeRole(req.authUser?.role || req.user?.role);
    const isAdmin = role === 'admin' || role === 'super admin' || role === 'superadmin';
    const patientId = req.authUser?.patient || null;
    const userId = req.authUser?._id || req.user?.id || null;
    const email = req.authUser?.email || req.user?.email || null;
    return { role, isAdmin, patientId, userId, email };
};

exports.createPatient = async (req, res) => {
    try {
        const access = getRequestAccess(req);
        const payload = { ...req.body };
        if (payload.gender != null) {
            payload.gender = normalizeGender(payload.gender);
        }

        // If patient is creating their profile, enforce account email as the profile email to keep linkage stable.
        if (access.role === 'patient' && access.email) {
            payload.email = String(access.email).toLowerCase();
        }

        const patientId = new mongoose.Types.ObjectId();
        payload._id = patientId;
        const fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'patient';
        if (isDataUrl(payload.profileImage)) {
            payload.profileImage = saveDataUrlFile({
                dataUrl: payload.profileImage,
                ownerType: 'patients',
                ownerId: patientId,
                ownerName: fullName,
                bucket: 'images',
                label: 'profile',
            });
        }

        const newPatient = new Patient(payload);
        const savedPatient = await newPatient.save();

        // Link created Patient to the authenticated User (best effort).
        if (access.userId && mongoose.Types.ObjectId.isValid(String(access.userId))) {
            try {
                await User.findByIdAndUpdate(
                    access.userId,
                    {
                        patient: savedPatient._id,
                        ...(access.role ? { role: req.authUser?.role || req.user?.role || 'Patient' } : {}),
                        ...(payload.email ? { email: String(payload.email).toLowerCase() } : {}),
                        name: `${savedPatient.firstName || ''} ${savedPatient.lastName || ''}`.trim() || undefined,
                        image: savedPatient.profileImage || undefined,
                    },
                    { new: true }
                );
            } catch {
                // Ignore linkage errors; profile is still created.
            }
        }

        // Send notification to all admins and super admins about new patient registration
        notifyAdminAndSuperAdminUsers({
            type: 'system',
            title: 'New patient registration',
            message: `${savedPatient.firstName || 'A patient'} ${savedPatient.lastName || ''}`.trim() + ' has registered successfully.',
            actionUrl: '/admin/users-dashboard',
        }).catch(() => null);

        res.status(201).json(sanitizePatient(savedPatient));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().select('-password');
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/** GET /api/patients/me — current user’s Patient row (Bearer token). */
exports.getMyPatient = async (req, res) => {
    try {
        const rawUid = req.authUser?._id || req.user?.id;
        if (!rawUid) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        await ensurePatientProfileLinked(rawUid, {
            email: req.authUser?.email || req.user?.email,
            name: req.authUser?.name || req.user?.name,
        });
        const user = await User.findById(rawUid).select('patient email role').lean();
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        let patient = null;
        if (user.patient) {
            patient = await Patient.findById(user.patient).select('-password');
        }
        const emailHint = String(user.email || req.authUser?.email || req.user?.email || '').toLowerCase();
        if (!patient && emailHint) {
            const email = emailHint;
            patient = await Patient.findOne({ email }).select('-password');
            if (patient) {
                await User.findByIdAndUpdate(rawUid, {
                    patient: patient._id,
                    role: user.role || 'Patient',
                });
            }
        }
        if (!patient) {
            return res.status(404).json({
                success: false,
                error:
                    'No patient record matches this account. Complete patient registration or use the same email as in your medical profile.',
            });
        }
        res.status(200).json({ success: true, data: sanitizePatient(patient) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const access = getRequestAccess(req);
        const id = String(req.params.id || '').trim();
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ success: false, error: 'Valid Patient ID is required' });
        }

        // Patients can only access their own profile.
        if (access.role === 'patient' && access.patientId) {
            const isLegacy = id.startsWith('PID_');
            if (isLegacy) {
                // Allow legacy id only if it maps to the same patient row.
                const self = await Patient.findById(access.patientId).select('Patient_Id').lean();
                if (!self || String(self.Patient_Id || '') !== id) {
                    return res.status(403).json({ success: false, error: 'Forbidden' });
                }
            } else if (mongoose.Types.ObjectId.isValid(id)) {
                if (String(access.patientId) !== String(id)) {
                    return res.status(403).json({ success: false, error: 'Forbidden' });
                }
            }
        }

        const query = id.startsWith('PID_') ? { Patient_Id: id } : (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null);
        if (!query) {
            return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }
        const patient = await Patient.findOne(query).select('-password');
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.status(200).json({ success: true, data: sanitizePatient(patient) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const access = getRequestAccess(req);
        const query = req.params.id.startsWith('PID_') ? { Patient_Id: req.params.id } : { _id: req.params.id };
        const updates = { ...req.body };
        if (!updates.password) delete updates.password;
        if (updates.gender != null) {
            updates.gender = normalizeGender(updates.gender);
        }

        // Patients can only update their own row.
        if (access.role === 'patient' && access.patientId) {
            const isLegacy = req.params.id.startsWith('PID_');
            if (isLegacy) {
                const self = await Patient.findById(access.patientId).select('Patient_Id').lean();
                if (!self || String(self.Patient_Id || '') !== String(req.params.id)) {
                    return res.status(403).json({ success: false, error: 'Forbidden' });
                }
            } else if (mongoose.Types.ObjectId.isValid(String(req.params.id))) {
                if (String(access.patientId) !== String(req.params.id)) {
                    return res.status(403).json({ success: false, error: 'Forbidden' });
                }
            }
        }

        // If patient updates, keep email consistent with account to avoid unlinking later.
        if (access.role === 'patient' && access.email) {
            updates.email = String(access.email).toLowerCase();
        }

        const currentPatient = await Patient.findOne(query).select('_id firstName lastName').lean();
        if (!currentPatient) return res.status(404).json({ error: 'Patient not found' });
        const fullName = `${updates.firstName || currentPatient.firstName || ''} ${updates.lastName || currentPatient.lastName || ''}`.trim() || 'patient';
        if (isDataUrl(updates.profileImage)) {
            updates.profileImage = saveDataUrlFile({
                dataUrl: updates.profileImage,
                ownerType: 'patients',
                ownerId: currentPatient._id,
                ownerName: fullName,
                bucket: 'images',
                label: 'profile',
            });
        }

        const patient = await Patient.findOneAndUpdate(query, updates, {
            new: true,
            runValidators: true,
            select: '-password',
        });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        // Best effort: keep User.patient linkage stable.
        if (access.userId && mongoose.Types.ObjectId.isValid(String(access.userId))) {
            try {
                await User.findByIdAndUpdate(access.userId, {
                    patient: patient._id,
                    ...(updates.email ? { email: String(updates.email).toLowerCase() } : {}),
                    name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || undefined,
                    image: patient.profileImage || undefined,
                    ...(access.role ? { role: req.authUser?.role || req.user?.role } : {}),
                });
            } catch {
                // ignore
            }
        }

        res.status(200).json({ success: true, data: sanitizePatient(patient) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const query = req.params.id.startsWith('PID_') ? { Patient_Id: req.params.id } : { _id: req.params.id };
        const patient = await Patient.findOneAndDelete(query);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchPatients = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        const searchRegex = new RegExp(query, 'i');
        const patients = await Patient.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { Patient_Id: searchRegex }
            ]
        }).select('-password');

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMyLocation = async (req, res) => {
    try {
        const access = getRequestAccess(req);
        if (access.role !== 'patient' || !access.patientId) {
            return res.status(403).json({ success: false, error: 'Only patients can update their current location' });
        }

        const latitude = Number(req.body?.latitude);
        const longitude = Number(req.body?.longitude);
        const accuracy =
            req.body?.accuracy == null || req.body?.accuracy === ''
                ? null
                : Number(req.body.accuracy);
        const label = String(req.body?.label || '').trim();

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return res.status(400).json({ success: false, error: 'Valid latitude and longitude are required' });
        }

        const patient = await Patient.findByIdAndUpdate(
            access.patientId,
            {
                $set: {
                    currentLocation: {
                        latitude,
                        longitude,
                        accuracy: Number.isFinite(accuracy) ? accuracy : null,
                        label,
                        updatedAt: new Date(),
                    },
                },
            },
            { new: true, select: '-password' },
        );

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        return res.status(200).json({ success: true, data: sanitizePatient(patient) });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
