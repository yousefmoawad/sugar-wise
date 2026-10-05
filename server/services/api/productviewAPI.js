const ProductView = require('../../models/ProductView');

async function create(data) {
  return await ProductView.create(data);
}

async function getAll() {
  return await ProductView.find({});
}

async function getById(id) {
  const item = await ProductView.findById(id);
  if (!item) {
    const err = new Error('ProductView not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await ProductView.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('ProductView not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await ProductView.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('ProductView not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };