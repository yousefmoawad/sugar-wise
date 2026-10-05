const Product = require('../../models/Product');

async function create(data) {
  return await Product.create(data);
}

async function getAll() {
  return await Product.find({});
}

async function getById(id) {
  const item = await Product.findById(id);
  if (!item) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Product.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };