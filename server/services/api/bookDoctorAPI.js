const BookDoctor = require('../../models/BookDoctor');

async function create(data) {
  return BookDoctor.create(data);
}

async function getAll(filter = {}) {
  return BookDoctor.find(filter).sort({ createdAt: -1 });
}

async function getById(id) {
  const booking = await BookDoctor.findById(id);
  if (!booking) {
    const err = new Error('Doctor booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

async function update(id, updates) {
  const booking = await BookDoctor.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!booking) {
    const err = new Error('Doctor booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

async function remove(id) {
  const booking = await BookDoctor.findByIdAndDelete(id);
  if (!booking) {
    const err = new Error('Doctor booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

module.exports = { create, getAll, getById, update, remove };
