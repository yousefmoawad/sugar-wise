const MyPatient = require('../../models/MyPatient');
const Patient = require('../../models/Patient');
const User = require('../../models/User');

const calcAge = (birthday) => {
  if (!birthday) return 0;
  const dob = new Date(birthday);
  if (Number.isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
};

async function create(data, context = {}) {
  const doctorUserId = context.authUser?._id || context.authUser?.id;
  if (!doctorUserId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const patientProfileId =
    data.patientProfile ||
    data.patientProfileId ||
    data.patient?._id ||
    data.patient ||
    null;

  let patient = null;
  if (patientProfileId) {
    patient = await Patient.findById(patientProfileId).lean();
  }

  const patientUserId =
    data.patientUser ||
    data.patientUserId ||
    (patient?._id ? (await User.findOne({ patient: patient._id }).select('_id').lean())?._id : null) ||
    null;

  if (patient?._id) {
    const existing = await MyPatient.findOne({
      doctorUser: doctorUserId,
      patientProfile: patient._id,
    });
    if (existing) return existing;
  }

  const payload = {
    doctorUser: doctorUserId,
    doctorProfile: context.authUser?.doctor || null,
    patientUser: patientUserId || null,
    patientProfile: patient?._id || patientProfileId || null,
    name:
      data.name ||
      `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() ||
      'Unknown',
    email: data.email || patient?.email || '',
    image: data.image || patient?.profileImage || '',
    age: Number(data.age) || calcAge(patient?.birthday),
    lastTest: data.lastTest || '',
    insulin: data.insulin || patient?.insulinPrimaryDosage || '',
    status: data.status || 'Normal',
  };

  return await MyPatient.create(payload);
}

async function getAll(context = {}) {
  const doctorUserId = context.authUser?._id || context.authUser?.id;
  if (!doctorUserId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  return await MyPatient.find({ doctorUser: doctorUserId })
    .populate(
      'patientProfile',
      'firstName lastName birthday weight height bloodType profileImage email insulinPrimary insulinPrimaryDosage insulinSecondary insulinSecondaryDosage medicalCondition Patient_Id currentLocation address city governorate phone'
    )
    .sort({ createdAt: -1 });
}

async function getById(id, context = {}) {
  const doctorUserId = context.authUser?._id || context.authUser?.id;
  const item = await MyPatient.findOne({ _id: id, doctorUser: doctorUserId }).populate(
    'patientProfile',
    'firstName lastName birthday weight height bloodType profileImage email insulinPrimary insulinPrimaryDosage insulinSecondary insulinSecondaryDosage medicalCondition Patient_Id currentLocation address city governorate phone'
  );
  if (!item) {
    const err = new Error('My patient record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates, context = {}) {
  const doctorUserId = context.authUser?._id || context.authUser?.id;
  const item = await MyPatient.findOneAndUpdate({ _id: id, doctorUser: doctorUserId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('My patient record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id, context = {}) {
  const doctorUserId = context.authUser?._id || context.authUser?.id;
  const item = await MyPatient.findOneAndDelete({ _id: id, doctorUser: doctorUserId });
  if (!item) {
    const err = new Error('My patient record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };
