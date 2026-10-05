const mongoose = require('mongoose');
require('../models/Selling');
require('../models/VerificationDoctor');

const connectDB = async () => {
  const primary = process.env.MONGO_URI;
  const fallback =
    process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/sugarwise';

  try {
    if (!primary) {
      throw new Error('MONGO_URI is not set');
    }
    const conn = await mongoose.connect(primary);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
  }

  // Fallback is helpful when Atlas is unreachable on some networks.
  try {
    if (fallback && fallback !== primary) {
      const conn2 = await mongoose.connect(fallback);
      console.log(`✅ MongoDB Connected (fallback): ${conn2.connection.host}`);
      return;
    }
  } catch (error) {
    console.error(`❌ MongoDB fallback connection error: ${error.message}`);
  }

  process.exit(1);
};

module.exports = connectDB;

