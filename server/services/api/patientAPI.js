const Patient = require('../../models/Patient');

async function create(data) {
  return await Patient.create(data);
}

async function getAll() {
  return await Patient.find({});
}

async function getById(id) {
  const item = await Patient.findById(id);
  if (!item) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Patient.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Patient not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };