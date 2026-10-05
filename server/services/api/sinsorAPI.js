// TODO: implement API service for Sinsor. Model not currently available.

async function create(data) {
  const err = new Error('Sinsor API not implemented');
  err.statusCode = 501;
  throw err;
}

async function getAll() {
  const err = new Error('Sinsor API not implemented');
  err.statusCode = 501;
  throw err;
}

async function getById(id) {
  const err = new Error('Sinsor API not implemented');
  err.statusCode = 501;
  throw err;
}

async function update(id, updates) {
  const err = new Error('Sinsor API not implemented');
  err.statusCode = 501;
  throw err;
}

async function remove(id) {
  const err = new Error('Sinsor API not implemented');
  err.statusCode = 501;
  throw err;
}

module.exports = { create, getAll, getById, update, remove };