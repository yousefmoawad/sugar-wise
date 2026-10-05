const Order = require('../../models/Order');

async function create(data) {
  return await Order.create(data);
}

async function getAll() {
  return await Order.find({});
}

async function getById(id) {
  const item = await Order.findById(id);
  if (!item) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Order.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };