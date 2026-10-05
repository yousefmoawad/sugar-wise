const PromoCode = require('../../models/PromoCode');

async function create(data) {
  return await PromoCode.create(data);
}

async function getAll() {
  return await PromoCode.find({});
}

async function getById(id) {
  const item = await PromoCode.findById(id);
  if (!item) {
    const err = new Error('PromoCode not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function update(id, updates) {
  const item = await PromoCode.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!item) {
    const err = new Error('PromoCode not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

async function remove(id) {
  const item = await PromoCode.findByIdAndDelete(id);
  if (!item) {
    const err = new Error('PromoCode not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
}

module.exports = { create, getAll, getById, update, remove };