const Shop = require('../../models/Shop');

async function create(data) {
  return await Shop.create(data);
}

async function getAll() {
  return await Shop.find({});
}

async function getById(id) {
  const item = await Shop.findById(id);
  if (!item) {
    const err = new Error('Shop not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Shop.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Shop not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Shop.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Shop not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };