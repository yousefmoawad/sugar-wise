const myClinicAPI = require('../services/api/myClinicAPI');

const normalizeDoctorId = (body, authUser) => {
  if (body?.doctorId) return body.doctorId;
  if (authUser?.doctor) return authUser.doctor;
  return null;
};

exports.createClinic = async (req, res) => {
  try {
    const doctorId = normalizeDoctorId(req.body, req.authUser);
    const payload = { ...req.body, ...(doctorId ? { doctorId } : {}) };
    const clinic = await myClinicAPI.create(payload);
    res.status(201).json({
      success: true,
      data: clinic,
      message: 'Clinic created successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.getClinics = async (req, res) => {
  try {
    let list;
    const role = String(req.authUser?.role || '').toLowerCase();
    const doctorProfileId = req.authUser?.doctor;

    if (doctorProfileId && role === 'doctor') {
      list = await myClinicAPI.getByDoctor(doctorProfileId);
    } else {
      list = await myClinicAPI.getAll({});
    }

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
      message: 'Clinics retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.getClinicById = async (req, res) => {
  try {
    const clinic = await myClinicAPI.getById(req.params.id);
    res.status(200).json({
      success: true,
      data: clinic,
      message: 'Clinic retrieved successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

exports.updateClinic = async (req, res) => {
  try {
    const doctorId = normalizeDoctorId(req.body, req.authUser);
    const payload = { ...req.body, ...(doctorId ? { doctorId } : {}) };
    const clinic = await myClinicAPI.update(req.params.id, payload);
    res.status(200).json({
      success: true,
      data: clinic,
      message: 'Clinic updated successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
};

exports.deleteClinic = async (req, res) => {
  try {
    await myClinicAPI.remove(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Clinic deleted successfully',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};
