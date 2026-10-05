const Admin = require('../../models/Admin');

async function create(data) {
  return await Admin.create(data);
}

async function getAll() {
  return await Admin.find({});
}

async function getById(id) {
  const item = await Admin.findById(id);
  if (!item) {
    const err = new Error('Admin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Admin.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Admin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Admin.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Admin not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };