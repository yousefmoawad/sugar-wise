const fs = require('fs');
const path = require('path');
const { REPORT_ROOT } = require('../utils/fileStorage');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

exports.getProtectedFile = async (req, res) => {
  try {
    const relativePath = String(req.params[0] || '')
      .replace(/\\/g, '/')
      .replace(/\.\./g, '');
    if (!relativePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const segments = relativePath.split('/').filter(Boolean);
    const [ownerType, ownerId] = segments;
    const role = normalizeRole(req.authUser?.role);
    const authPatientId = String(req.authUser?.patient || '');
    const authDoctorId = String(req.authUser?.doctor || '');
    const canManageAll = role === 'admin' || role === 'super admin' || role === 'superadmin';

    const isOwnPatientReport = ownerType === 'patients' && authPatientId && authPatientId === ownerId;
    const isOwnDoctorReport = ownerType === 'doctors' && authDoctorId && authDoctorId === ownerId;
    const canDoctorViewPatientReport = role === 'doctor' && ownerType === 'patients';

    if (!canManageAll && !isOwnPatientReport && !isOwnDoctorReport && !canDoctorViewPatientReport) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const absolutePath = path.join(REPORT_ROOT, relativePath);
    if (!absolutePath.startsWith(REPORT_ROOT)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    return res.sendFile(absolutePath);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
