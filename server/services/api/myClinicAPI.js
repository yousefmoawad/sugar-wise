const MyClinic = require('../../models/MyClinic');

async function create(data) {
  return await MyClinic.create(data);
}

async function getAll(filter = {}) {
  return await MyClinic.find(filter).sort({ createdAt: -1 });
}

async function getByDoctor(doctorId) {
  if (!doctorId) return [];
  return await MyClinic.find({ doctorId }).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await MyClinic.findById(id);
  if (!item) {
    const err = new Error('Clinic record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await MyClinic.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('Clinic record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await MyClinic.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Clinic record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getByDoctor, getById, update, remove };
