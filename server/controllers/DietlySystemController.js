const dietlySystemAPI = require('../services/api/dietlySystemAPI');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();
const canManageAllDietary = (req) => {
  const role = normalizeRole(req.authUser?.role);
  return role === 'admin' || role === 'super admin' || role === 'superadmin' || role === 'subadmin';
};

const assertPatientOwns = (doc, req) => {
  if (!doc) return false;
  if (canManageAllDietary(req)) {
    return true;
  }
  if (!req.authUser?.patient) return false;
  if (!doc.patientId) return false;
  return String(doc.patientId) === String(req.authUser.patient);
};

exports.createDietlySystem = async (req, res) => {
  try {
    if (!req.authUser?._id && !req.user?.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const payload = { ...req.body };

    if (req.authUser?.patient) {
      payload.patientId = req.authUser.patient;
    } else if (!canManageAllDietary(req)) {
      return res.status(403).json({ success: false, error: 'Only patients or administrators can create meals' });
    }

    if (!payload.patientId) {
      return res.status(400).json({ success: false, error: 'patientId is required' });
    }
    const dietlySystem = await dietlySystemAPI.create(payload);
    res.status(201).json({
      success: true,
      data: dietlySystem,
      message: 'Dietly system created successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.getDietlySystems = async (req, res) => {
  try {
    if (!req.authUser?._id && !req.user?.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const patientId = req.authUser?.patient;
    const filter = canManageAllDietary(req) ? {} : patientId ? { patientId } : null;
    if (!filter) {
      return res.status(403).json({ success: false, error: 'No patient profile linked to this account' });
    }
    const systems = await dietlySystemAPI.getAll(filter);
    res.status(200).json({
      success: true,
      count: systems.length,
      data: systems,
      message: 'Dietly systems retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.getDietlySystemById = async (req, res) => {
  try {
    const system = await dietlySystemAPI.getById(req.params.id);
    if (!assertPatientOwns(system, req)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    res.status(200).json({
      success: true,
      data: system,
      message: 'Dietly system retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.updateDietlySystem = async (req, res) => {
  try {
    const existing = await dietlySystemAPI.getById(req.params.id);
    if (!assertPatientOwns(existing, req)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const system = await dietlySystemAPI.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: system,
      message: 'Dietly system updated successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.deleteDietlySystem = async (req, res) => {
  try {
    const existing = await dietlySystemAPI.getById(req.params.id);
    if (!assertPatientOwns(existing, req)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    await dietlySystemAPI.remove(req.params.id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Dietly system deleted successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};
