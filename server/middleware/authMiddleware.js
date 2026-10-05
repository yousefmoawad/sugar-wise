const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'super admin' || value === 'superadmin' || value === 'subadmin') return 'superadmin';
  if (value === 'admin') return 'admin';
  if (value === 'doctor') return 'doctor';
  if (value === 'patient') return 'patient';
  return value;
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Authorization token is missing or invalid',
    });
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token',
        message: 'Please login again',
      });
    }

    req.user = user;
    req.authUser = {
      _id: user.id,
      role: user.role,
      email: user.email,
      patient: user.patientProfileId || null,
      doctor: user.doctorProfileId || null,
    };
    try {
      const doc = await User.findById(user.id).select('patient doctor role name email image').lean();
      if (doc) {
        req.authUser = { ...req.authUser, ...doc, _id: doc._id };
      }
    } catch (dbError) {
      // Ignore DB lookup errors and keep JWT payload as fallback.
    }
    next();
  });
}

function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map((role) => normalizeRole(role));
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have access to this resource',
      });
    }

    next();
  };
}

/**
 * If Authorization Bearer token is present and valid, sets req.user (JWT payload)
 * and req.authUser (full User lean doc with patient/doctor links). Does not fail if missing/invalid.
 */
function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return next();
    }
    req.user = decoded;
    req.authUser = {
      _id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      patient: decoded.patientProfileId || null,
      doctor: decoded.doctorProfileId || null,
    };
    try {
      const doc = await User.findById(decoded.id).select('patient doctor role name email image').lean();
      if (doc) {
        req.authUser = { ...req.authUser, ...doc, _id: doc._id };
      }
    } catch (e) {
      // ignore DB errors for optional auth
    }
    next();
  });
}

module.exports = { authenticateToken, authorizeRole, optionalAuthenticateToken };
