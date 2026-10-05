const Patient = require('../models/Patient');
const User = require('../models/User');
const labTestAPI = require('../services/api/labTestAPI');
const { ensurePatientProfileLinked } = require('../utils/ensurePatientLink');
const { isDataUrl, saveDataUrlFile } = require('../utils/fileStorage');
const { notifyDoctorsAboutLabTest } = require('../services/patientAlertService');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const resolvePatientKey = async (authUser) => {
  if (!authUser?.patient) return null;
  const patient = await Patient.findById(authUser.patient).select('Patient_Id').lean();
  return {
    objectId: String(authUser.patient),
    legacyId: patient?.Patient_Id ? String(patient.Patient_Id) : null,
  };
};

const canManageAllLabTests = (authUser) => {
  const role = normalizeRole(authUser?.role);
  return role === 'admin' || role === 'super admin' || role === 'superadmin' || role === 'doctor';
};

const assertPatientOwnership = (test, patientKey) => {
  if (!patientKey) return false;
  const ownerId = String(test?.Patient_Id || '');
  return ownerId === patientKey.objectId || ownerId === String(patientKey.legacyId || '');
};

exports.createLabTest = async (req, res) => {
  try {
    const role = normalizeRole(req.authUser?.role);
    
    // For patients, ensure patient profile is linked
    if (role === 'patient' && req.authUser?._id) {
      await ensurePatientProfileLinked(req.authUser._id, {
        email: req.authUser.email,
        name: req.authUser.name,
      }).catch(() => null);
      
      // Refresh authUser to get updated patient link
      const updatedUser = await User.findById(req.authUser._id).select('patient doctor role name email image').lean();
      if (updatedUser) {
        req.authUser = { ...req.authUser, ...updatedUser, _id: updatedUser._id };
      }
    }

    const patientKey = await resolvePatientKey(req.authUser);
    let Patient_Id = req.body.Patient_Id || req.body.patientId || '';
    let Name = req.body.Name || req.body.name || '';

    if (role === 'patient') {
      if (!patientKey?.objectId) {
        return res.status(403).json({ success: false, error: 'Patient profile is not linked to this account' });
      }

      Patient_Id = patientKey.objectId;
      const pat = await Patient.findById(req.authUser.patient).select('firstName lastName').lean();
      if (pat) {
        Name = `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || Name || 'Patient';
      }
    }

    if (role !== 'patient' && !canManageAllLabTests(req.authUser)) {
      return res.status(403).json({ success: false, error: 'Only patients or administrators can create lab tests' });
    }

    if (!Patient_Id) {
      return res.status(400).json({ success: false, error: 'Patient_Id is required for lab tests' });
    }
    if (!Name) Name = 'Patient';

    let fileUrl = req.body.fileUrl || null;
    if (isDataUrl(fileUrl)) {
      fileUrl = saveDataUrlFile({
        dataUrl: fileUrl,
        ownerType: 'patients',
        ownerId: Patient_Id,
        ownerName: Name,
        bucket: 'reports',
        label: req.body.title || 'lab_test',
      });
    }

    const labTest = await labTestAPI.create({
      ...req.body,
      Patient_Id,
      Name,
      fileUrl,
    });
    if (role === 'patient') {
      await notifyDoctorsAboutLabTest(labTest).catch((error) => {
        console.error('Failed to notify doctors about lab test:', error.message);
      });
    }
    res.status(201).json({
      success: true,
      data: labTest,
      message: 'Lab test created successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.getLabTests = async (req, res) => {
  try {
    const role = normalizeRole(req.authUser?.role);
    
    // For patients, ensure patient profile is linked before querying
    if (role === 'patient' && req.authUser?._id) {
      await ensurePatientProfileLinked(req.authUser._id, {
        email: req.authUser.email,
        name: req.authUser.name,
      }).catch(() => null);
      
      // Refresh authUser to get updated patient link
      const updatedUser = await User.findById(req.authUser._id).select('patient doctor role name email image').lean();
      if (updatedUser) {
        req.authUser = { ...req.authUser, ...updatedUser, _id: updatedUser._id };
      }
    }

    const patientKey = await resolvePatientKey(req.authUser);
    const filter = role === 'patient'
      ? { Patient_Id: { $in: [patientKey?.objectId, patientKey?.legacyId].filter(Boolean) } }
      : canManageAllLabTests(req.authUser)
        ? {}
        : { _id: null };
    
    const tests = await labTestAPI.getAll(filter);
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
      message: 'Lab tests retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.getLabTestById = async (req, res) => {
  try {
    const role = normalizeRole(req.authUser?.role);
    const patientKey = await resolvePatientKey(req.authUser);
    const test = await labTestAPI.getById(req.params.id);
    if (role === 'patient' && !assertPatientOwnership(test, patientKey)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }
    if (role !== 'patient' && !canManageAllLabTests(req.authUser)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }
    res.status(200).json({
      success: true,
      data: test,
      message: 'Lab test retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.updateLabTest = async (req, res) => {
  try {
    const role = normalizeRole(req.authUser?.role);
    const patientKey = await resolvePatientKey(req.authUser);
    const existing = await labTestAPI.getById(req.params.id);

    if (role === 'patient' && !assertPatientOwnership(existing, patientKey)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }
    if (role !== 'patient' && !canManageAllLabTests(req.authUser)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }

    const payload = { ...req.body };
    if (role === 'patient') {
      payload.Patient_Id = patientKey.objectId;
      if (!payload.Name) {
        const pat = await Patient.findById(req.authUser.patient).select('firstName lastName').lean();
        if (pat) {
          payload.Name = `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || existing.Name;
        }
      }
    }
    if (isDataUrl(payload.fileUrl)) {
      payload.fileUrl = saveDataUrlFile({
        dataUrl: payload.fileUrl,
        ownerType: 'patients',
        ownerId: existing.Patient_Id || patientKey?.objectId,
        ownerName: payload.Name || existing.Name || 'patient',
        bucket: 'reports',
        label: payload.title || existing.title || 'lab_test',
      });
    }

    const labTest = await labTestAPI.update(req.params.id, payload);
    if (role === 'patient') {
      await notifyDoctorsAboutLabTest(labTest).catch((error) => {
        console.error('Failed to notify doctors about updated lab test:', error.message);
      });
    }
    res.status(200).json({
      success: true,
      data: labTest,
      message: 'Lab test updated successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.deleteLabTest = async (req, res) => {
  try {
    const role = normalizeRole(req.authUser?.role);
    const patientKey = await resolvePatientKey(req.authUser);
    const existing = await labTestAPI.getById(req.params.id);

    if (role === 'patient' && !assertPatientOwnership(existing, patientKey)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }
    if (role !== 'patient' && !canManageAllLabTests(req.authUser)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this lab test' });
    }

    await labTestAPI.remove(req.params.id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Lab test deleted successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};
