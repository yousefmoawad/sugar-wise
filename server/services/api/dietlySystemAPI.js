const DietlySystem = require('../../models/DietlySystem');

async function create(data) {
  return await DietlySystem.create(data);
}

async function getAll(filter = {}) {
  return await DietlySystem.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await DietlySystem.findById(id);
  if (!item) {
    const err = new Error('Dietly system record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await DietlySystem.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('Dietly system record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await DietlySystem.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Dietly system record not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };
