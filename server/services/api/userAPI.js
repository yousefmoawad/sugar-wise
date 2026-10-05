const User = require('../../models/User');

async function create(data) {
  return await User.create(data);
}

async function getAll() {
  return await User.find({});
}

async function getById(id) {
  const item = await User.findById(id);
  if (!item) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await User.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };