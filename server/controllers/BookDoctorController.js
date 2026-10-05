// Book Doctor Controller
const bookDoctorAPI = require('../services/api/bookDoctorAPI');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

const resolveDoctorIdFromPayload = async (body) => {
  if (body.doctorId) return body.doctorId;
  const label = String(body.doctorName || '').trim();
  if (!label) return null;
  const docs = await Doctor.find({}).select('_id firstName lastName').limit(300).lean();
  const lower = label.toLowerCase();
  const hit = docs.find((d) => {
    const full = `${d.firstName || ''} ${d.lastName || ''}`.trim().toLowerCase();
    return full === lower || full.includes(lower) || lower.includes(full);
  });
  return hit ? hit._id : null;
};

exports.createBookDoctor = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.authUser?.patient && !body.patientId) {
      body.patientId = req.authUser.patient;
    }
    if (!body.doctorId) {
      const guessed = await resolveDoctorIdFromPayload(body);
      if (guessed) body.doctorId = guessed;
    }

    const booking = await bookDoctorAPI.create(body);

    const doctor = body.doctorId ? await Doctor.findById(body.doctorId) : null;
    const patient = body.patientId ? await Patient.findById(body.patientId) : null;

    const doctorUser = body.doctorId ? await User.findOne({ doctor: body.doctorId }).select('_id').lean() : null;
    const patientUser = body.patientId ? await User.findOne({ patient: body.patientId }).select('_id').lean() : null;

    if (doctorUser?._id) {
      await Notification.create({
        user: doctorUser._id,
        type: 'booking',
        title: 'New appointment',
        actionUrl: '/doctor/notifications',
        message: `${patient?.firstName || body.patientName || 'A patient'} booked ${body.clinicName || 'a clinic'} on ${body.appointmentDate} at ${body.appointmentTime}.`,
        isRead: false,
      });
    }

    if (patientUser?._id) {
      await Notification.create({
        user: patientUser._id,
        type: 'booking',
        title: 'Appointment booked',
        actionUrl: doctor?._id ? `/doctor-view/${String(doctor._id)}` : '/notifications-patient',
        message: `Your appointment with ${doctor?.firstName || body.doctorName || 'the doctor'} is confirmed for ${body.appointmentDate} at ${body.appointmentTime}.`,
        isRead: false,
      });
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Doctor booking created successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

exports.getBookDoctors = async (req, res) => {
  try {
    if (!req.authUser?._id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const filter = {};
    const role = normalizeRole(req.authUser.role);
    if (role === 'admin' || role === 'super admin' || role === 'superadmin' || role === 'subadmin') {
      // staff: all bookings
    } else if (req.authUser.patient) {
      filter.patientId = req.authUser.patient;
    } else if (req.authUser.doctor) {
      filter.doctorId = req.authUser.doctor;
    } else {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No patient or doctor profile linked to this account',
      });
    }
    const bookings = await bookDoctorAPI.getAll(filter);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
      message: 'Doctor bookings retrieved successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBookDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookDoctorAPI.getById(id);
    res.status(200).json({
      success: true,
      data: booking,
      message: 'Doctor booking retrieved successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateBookDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookDoctorAPI.update(id, req.body);
    res.status(200).json({
      success: true,
      data: booking,
      message: 'Doctor booking updated successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteBookDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await bookDoctorAPI.remove(id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Doctor booking deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
