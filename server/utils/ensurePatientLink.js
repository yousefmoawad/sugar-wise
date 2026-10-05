const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');

/**
 * If User has no valid Patient ref, link Patient row by email (case-insensitive) or name match.
 */
async function ensurePatientProfileLinked(rawUserId, hints = {}) {
  if (!rawUserId) return null;
  let uid;
  try {
    uid = mongoose.Types.ObjectId.isValid(String(rawUserId))
      ? new mongoose.Types.ObjectId(String(rawUserId))
      : null;
  } catch {
    uid = null;
  }
  if (!uid) return null;

  let u = await User.findById(uid);
  if (!u) return null;

  // Many installs have legacy User rows with empty email; fall back to JWT-provided hints.
  const hintedEmail = hints?.email ? String(hints.email).toLowerCase().trim() : '';
  const hintedName = hints?.name ? String(hints.name).trim() : '';
  const effectiveEmail = (u.email ? String(u.email) : hintedEmail).toLowerCase().trim();
  const effectiveName = String(u.name || hintedName || '').trim();

  if (!effectiveEmail && !effectiveName) return u;

  if (u.patient) {
    const exists = await Patient.findById(u.patient).select('_id').lean();
    if (exists) return u;
    u.patient = undefined;
    await u.save();
  }

  const lowered = effectiveEmail;
  const esc = lowered.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let pat = lowered ? await Patient.findOne({ email: lowered }).select('_id email') : null;
  if (!pat) {
    pat = lowered
      ? await Patient.findOne({
          email: { $regex: new RegExp(`^${esc}$`, 'i') },
        }).select('_id email')
      : null;
  }

  if (!pat && effectiveName) {
    const parts = effectiveName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const fnEsc = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const lnEsc = parts[parts.length - 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pat = await Patient.findOne({
        firstName: new RegExp(`^${fnEsc}$`, 'i'),
        lastName: new RegExp(`^${lnEsc}$`, 'i'),
      }).select('_id email');
    }
  }

  if (pat) {
    u.patient = pat._id;
    const r = String(u.role || '').trim().toLowerCase();
    if (!r || r === 'guest') u.role = 'Patient';
    if (!u.email && pat.email) u.email = String(pat.email).toLowerCase();
    await u.save();
  }

  return User.findById(uid);
}

module.exports = { ensurePatientProfileLinked };
