const Billing = require('../../models/Billing');

async function create(data) {
  return await Billing.create(data);
}

async function getAll() {
  return await Billing.find({});
}

async function getById(id) {
  const item = await Billing.findById(id);
  if (!item) {
    const err = new Error('Billing not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Billing.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Billing not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Billing.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Billing not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };