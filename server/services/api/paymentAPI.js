const Payment = require('../../models/Payment');

async function create(data) {
  return await Payment.create(data);
}

async function getAll() {
  return await Payment.find({});
}

async function getById(id) {
  const item = await Payment.findById(id);
  if (!item) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Payment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Payment.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };