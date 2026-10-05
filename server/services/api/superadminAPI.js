const SuperAdmin = require('../../models/SuperAdmin');

async function create(data) {
  return await SuperAdmin.create(data);
}

async function getAll() {
  return await SuperAdmin.find({});
}

async function getById(id) {
  const item = await SuperAdmin.findById(id);
  if (!item) {
    const err = new Error('SuperAdmin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await SuperAdmin.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('SuperAdmin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await SuperAdmin.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('SuperAdmin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };