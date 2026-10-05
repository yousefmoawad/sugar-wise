const Notification = require('../../models/Notification');

async function create(data) {
  return await Notification.create(data);
}

async function getAll(filter = {}) {
  return await Notification.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const item = await Notification.findById(id);
  if (!item) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Notification.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Notification.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };
