const ContactUs = require('../../models/ContactUs');

async function create(data) {
  return await ContactUs.create(data);
}

async function getAll() {
  return await ContactUs.find({});
}

async function getById(id) {
  const item = await ContactUs.findById(id);
  if (!item) {
    const err = new Error('ContactUs not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await ContactUs.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('ContactUs not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await ContactUs.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('ContactUs not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };