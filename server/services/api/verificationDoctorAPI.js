const VerificationDoctor = require('../../models/VerificationDoctor');

async function create(data) {
  return await VerificationDoctor.create(data);
}

async function getAll() {
  return await VerificationDoctor.find({});
}

async function getById(id) {
  const item = await VerificationDoctor.findById(id);
  if (!item) {
    const err = new Error('VerificationDoctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await VerificationDoctor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('VerificationDoctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await VerificationDoctor.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('VerificationDoctor not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };