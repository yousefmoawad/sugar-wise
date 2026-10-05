const Message = require('../../models/Message');

async function create(data) {
  return await Message.create(data);
}

async function getAll() {
  return await Message.find({});
}

async function getById(id) {
  const item = await Message.findById(id);
  if (!item) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await Message.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await Message.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };