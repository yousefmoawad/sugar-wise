const mongoose = require('mongoose');
const MyPatient = require('../models/MyPatient');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');

const normalizeStatus = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'high') return 'High';
  if (raw === 'low') return 'Low';
  if (raw === 'normal') return 'Normal';
  return 'Unknown';
};

const toObjectIdString = (value) => {
  if (!value) return '';
  if (value instanceof mongoose.Types.ObjectId) return String(value);
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const toPatientDisplayName = async (patientId, fallbackName = 'Patient') => {
  if (!patientId) return fallbackName;
  const patient = await Patient.findById(patientId)
    .select('firstName lastName')
    .lean()
    .catch(() => null);
  const fullName = `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim();
  return fullName || fallbackName;
};

const resolveSeverity = (status) => {
  if (status === 'High' || status === 'Low') return 'danger';
  return 'info';
};

const resolveMonitoringStatus = (level, unit = 'mg/dL') => {
  const numericLevel = Number(level);
  if (!Number.isFinite(numericLevel)) return 'Unknown';
  const highThreshold = unit === 'mmol/L' ? 7.8 : 140;
  const lowThreshold = unit === 'mmol/L' ? 3.9 : 70;
  if (numericLevel > highThreshold) return 'High';
  if (numericLevel < lowThreshold) return 'Low';
  return 'Normal';
};

const parseLabStatus = (labTest) => {
  const explicit = normalizeStatus(labTest?.resultStatus);
  if (explicit !== 'Unknown') return explicit;

  const text = `${labTest?.title || ''} ${labTest?.notes || ''}`.toLowerCase();
  if (text.includes('high')) return 'High';
  if (text.includes('low')) return 'Low';
  if (text.includes('normal')) return 'Normal';
  return 'Unknown';
};

const buildMonitoringNotification = async (monitoring) => {
  const patientId = toObjectIdString(monitoring?.patient);
  const patientName = await toPatientDisplayName(patientId);
  const status = resolveMonitoringStatus(monitoring?.level, monitoring?.unit);
  const severity = resolveSeverity(status);
  const insulinType = Array.isArray(monitoring?.insulin) && monitoring.insulin.length
    ? monitoring.insulin.join(', ')
    : 'None';
  const insulinUnits = Number(monitoring?.insulinUnit) || 0;

  return {
    patientId,
    status,
    severity,
    title:
      severity === 'danger'
        ? `${patientName} glucose alert`
        : `${patientName} added diabetes monitoring`,
    message: `${patientName}: ${monitoring?.level ?? '-'} ${monitoring?.unit || 'mg/dL'} | Status: ${status} | ${monitoring?.date || '-'} ${monitoring?.time || '-'} | Insulin: ${insulinType} | Units: ${insulinUnits}`,
    meta: {
      category: 'diabetes-monitoring',
      patientId,
      reading: monitoring?.level ?? null,
      unit: monitoring?.unit || 'mg/dL',
      status,
      date: monitoring?.date || '',
      time: monitoring?.time || '',
      insulin: Array.isArray(monitoring?.insulin) ? monitoring.insulin : [],
      insulinUnit: insulinUnits,
      monitoringId: toObjectIdString(monitoring?._id),
    },
  };
};

const buildLabTestNotification = async (labTest) => {
  const patientId = toObjectIdString(labTest?.Patient_Id);
  const patientName = await toPatientDisplayName(patientId, labTest?.Name || 'Patient');
  const status = parseLabStatus(labTest);
  const severity = resolveSeverity(status);

  return {
    patientId,
    status,
    severity,
    title:
      severity === 'danger'
        ? `${patientName} lab result alert`
        : `${patientName} uploaded a lab report`,
    message: `${patientName}: ${labTest?.title || 'Lab report'} | Status: ${status} | Date: ${labTest?.date || '-'}${labTest?.notes ? ` | Notes: ${labTest.notes}` : ''}`,
    meta: {
      category: 'lab-test',
      patientId,
      status,
      date: labTest?.date || '',
      title: labTest?.title || '',
      notes: labTest?.notes || '',
      labTestId: toObjectIdString(labTest?._id),
      fileUrl: labTest?.fileUrl || '',
    },
  };
};

const notifyDoctorsForPatient = async (patientId, payload) => {
  if (!patientId) return [];

  const links = await MyPatient.find({ patientProfile: patientId })
    .select('doctorUser')
    .lean();
  const doctorUserIds = [...new Set(links.map((link) => toObjectIdString(link.doctorUser)).filter(Boolean))];
  if (!doctorUserIds.length) return [];

  const notifications = doctorUserIds.map((doctorUserId) => ({
    user: doctorUserId,
    type: payload.meta?.category === 'lab-test'
      ? `patient-lab-${String(payload.status || 'unknown').toLowerCase()}`
      : `patient-monitoring-${String(payload.status || 'unknown').toLowerCase()}`,
    severity: payload.severity || 'info',
    actionUrl: payload.patientId
      ? `/doctor/my-patients?patient=${encodeURIComponent(payload.patientId)}&focus=insight`
      : '/doctor/my-patients',
    title: payload.title,
    message: payload.message,
    isRead: false,
    meta: payload.meta || null,
  }));

  return Notification.insertMany(notifications);
};

async function notifyDoctorsAboutMonitoring(monitoring) {
  const payload = await buildMonitoringNotification(monitoring);
  return notifyDoctorsForPatient(payload.patientId, payload);
}

async function notifyDoctorsAboutLabTest(labTest) {
  const payload = await buildLabTestNotification(labTest);
  return notifyDoctorsForPatient(payload.patientId, payload);
}

module.exports = {
  notifyDoctorsAboutMonitoring,
  notifyDoctorsAboutLabTest,
  resolveMonitoringStatus,
  parseLabStatus,
};
