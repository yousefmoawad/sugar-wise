const InsulinUnits = require('../../models/InsulinUnits');

async function create(data) {
  return await InsulinUnits.create(data);
}

async function getAll() {
  return await InsulinUnits.find({});
}

async function getById(id) {
  const item = await InsulinUnits.findById(id);
  if (!item) {
    const err = new Error('InsulinUnits not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await InsulinUnits.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('InsulinUnits not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await InsulinUnits.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('InsulinUnits not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };