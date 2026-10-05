const DiabetesMonitoring = require('../../models/DiabetesMonitoring');

async function create(data) {
  return await DiabetesMonitoring.create(data);
}

async function getAll(filter = {}) {
  return await DiabetesMonitoring.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await DiabetesMonitoring.findById(id);
  if (!item) {
    const err = new Error('Diabetes monitoring record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await DiabetesMonitoring.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('Diabetes monitoring record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await DiabetesMonitoring.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Diabetes monitoring record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };
