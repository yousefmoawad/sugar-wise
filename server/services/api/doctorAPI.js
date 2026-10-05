const Doctor = require('../../models/Doctor');

async function create(data) {
  return await Doctor.create(data);
}

async function getAll() {
  return await Doctor.find({});
}

async function getById(id) {
  const item = await Doctor.findById(id);
  if (!item) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Doctor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Doctor.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Doctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };