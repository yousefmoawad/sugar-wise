const Selling = require('../../models/Selling');

async function create(data) {
  return await Selling.create(data);
}

async function getAll() {
  return await Selling.find({});
}

async function getById(id) {
  const item = await Selling.findById(id);
  if (!item) {
    const err = new Error('Selling not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Selling.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Selling not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Selling.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Selling not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };