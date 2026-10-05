const LabTest = require('../../models/LabTest');

async function create(data) {
  return await LabTest.create(data);
}

async function getAll(filter = {}) {
  return await LabTest.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await LabTest.findById(id);
  if (!item) {
    const err = new Error('Lab test not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await LabTest.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('Lab test not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await LabTest.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Lab test not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };
