const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Notification = require('../models/Notification');
const VerificationDoctor = require('../models/VerificationDoctor');
const { ensurePatientProfileLinked } = require('../utils/ensurePatientLink');
const { isDataUrl, saveDataUrlFile } = require('../utils/fileStorage');

const buildDoctorLookup = (raw) => {
    const s = String(raw || '').trim();
    if (!s || s === 'undefined' || s === 'null') return null;
    // Accept either Mongo _id or our generated doctorId (e.g., DR1000).
    return mongoose.Types.ObjectId.isValid(s) ? { _id: s } : { doctorId: s };
};

const sanitizeDoctor = (doc) => {
    const doctor = doc.toObject ? doc.toObject() : doc;
    if (doctor) delete doctor.password;
    return doctor;
};

const computeExperienceYears = (doc) => {
    const raw = Number(doc?.yearsOfExperience);
    if (Number.isFinite(raw) && raw > 0) return Math.floor(raw);
    const join = doc?.joinDate || doc?.createdAt;
    if (!join) return 0;
    const d = new Date(join);
    if (Number.isNaN(d.getTime())) return 0;
    const yrs = new Date().getFullYear() - d.getFullYear();
    return Math.max(0, yrs);
};

const decorateDoctor = (doc, patientId) => {
    const d = sanitizeDoctor(doc);
    const followers = Array.isArray(d.followers) ? d.followers.map((x) => String(x)) : [];
    const ratings = Array.isArray(d.patientRatings) ? d.patientRatings : [];
    const pid = patientId ? String(patientId) : null;
    let currentUserRating = 0;
    if (pid) {
        const mine = ratings.find((r) => String(r.patient?._id || r.patient) === pid);
        if (mine) currentUserRating = Number(mine.value) || 0;
    }
    const sum = ratings.reduce((s, r) => s + Number(r.value || 0), 0);
    const avg = ratings.length ? sum / ratings.length : 0;
    const experienceYears = computeExperienceYears(d);
    const about =
        String(d.bio || d.title || '').trim() ||
        (d.medicalSpecialty ? `Specialist in ${d.medicalSpecialty}.` : '');
    const image = String(d.profileImage || d.image || '').trim();
    return {
        ...d,
        image,
        isFollowing: pid ? followers.includes(pid) : false,
        currentUserRating,
        averageRating: ratings.length ? Number(avg.toFixed(1)) : 0,
        ratingCount: ratings.length,
        followersCount: followers.length,
        patients: followers.length,
        experienceYears,
        about,
    };
};

const notifyUsers = async (notifications = []) => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    await Promise.all(
        notifications
            .filter((entry) => entry?.user)
            .map((entry) =>
                Notification.create({
                    user: entry.user,
                    type: entry.type || 'system',
                    title: entry.title,
                    message: entry.message,
                    actionUrl: entry.actionUrl || '',
                    isRead: false,
                }).catch(() => null)
            )
    );
};

const notifyAdminAndSuperAdminUsers = async (notification) => {
    const staffUsers = await User.find({
        role: { $in: ['Admin', 'Super Admin'] },
    })
        .select('_id')
        .lean()
        .catch(() => []);

    if (!staffUsers.length) return;

    await notifyUsers(
        staffUsers.map((user) => ({
            user: user._id,
            ...notification,
        }))
    );
};

const resolvePatientProfileId = async (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s || s === 'undefined' || s === 'null') return null;

    if (mongoose.Types.ObjectId.isValid(s)) {
        // Could be a Patient _id or a User _id. Prefer Patient, then fall back to User.patient.
        const p = await Patient.findById(s).select('_id').lean();
        if (p?._id) return String(p._id);
        const u = await User.findById(s).select('patient').lean();
        if (u?.patient) return String(u.patient);
        return null;
    }

    // Support legacy patient code (PID_00001)
    if (/^PID_/i.test(s)) {
        const p = await Patient.findOne({ Patient_Id: s }).select('_id').lean();
        if (p?._id) return String(p._id);
    }

    return null;
};

const ensureUserForDoctorProfile = async (doctorId) => {
    if (!doctorId) return null;
    const existing = await User.findOne({ doctor: doctorId }).select('_id').lean();
    if (existing?._id) return existing;

    const doc = await Doctor.findById(doctorId).select('email password firstName lastName role profileImage Status').lean();
    if (!doc?.email) return null;
    const email = String(doc.email).toLowerCase();
    const user = await User.findOneAndUpdate(
        { email },
        {
            doctor: doctorId,
            name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor',
            role: doc.role || 'Doctor',
            image: doc.profileImage || '',
            email,
            password: doc.password,
            status: String(doc.Status || 'Offline').toLowerCase() === 'online' ? 'online' : 'offline',
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select('_id');
    return user?._id ? { _id: user._id } : null;
};

const ensureUserForPatientProfile = async (patientId) => {
    if (!patientId) return null;
    const existing = await User.findOne({ patient: patientId }).select('_id').lean();
    if (existing?._id) return existing;

    const pat = await Patient.findById(patientId).select('email password firstName lastName role profileImage Status').lean();
    if (!pat?.email) return null;
    const email = String(pat.email).toLowerCase();
    const user = await User.findOneAndUpdate(
        { email },
        {
            patient: patientId,
            name: `${pat.firstName || ''} ${pat.lastName || ''}`.trim() || 'Patient',
            role: pat.role || 'Patient',
            image: pat.profileImage || '',
            email,
            password: pat.password,
            status: String(pat.Status || 'Offline').toLowerCase() === 'online' ? 'online' : 'offline',
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select('_id');
    return user?._id ? { _id: user._id } : null;
};

exports.createDoctor = async (req, res) => {
    try {
        const doctorId = new mongoose.Types.ObjectId();
        const fullName = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'doctor';
        const payload = { ...req.body, _id: doctorId };

        if (isDataUrl(payload.profileImage)) {
            payload.profileImage = saveDataUrlFile({
                dataUrl: payload.profileImage,
                ownerType: 'doctors',
                ownerId: doctorId,
                ownerName: fullName,
                bucket: 'images',
                label: 'profile',
            });
        }
        if (isDataUrl(payload.selfImg)) {
            payload.selfImg = saveDataUrlFile({
                dataUrl: payload.selfImg,
                ownerType: 'doctors',
                ownerId: doctorId,
                ownerName: fullName,
                bucket: 'images',
                label: 'selfie',
            });
        }
        if (isDataUrl(payload.idFrontImg)) {
            payload.idFrontImg = saveDataUrlFile({
                dataUrl: payload.idFrontImg,
                ownerType: 'doctors',
                ownerId: doctorId,
                ownerName: fullName,
                bucket: 'reports',
                label: 'id_front',
            });
        }
        if (isDataUrl(payload.idBackImg)) {
            payload.idBackImg = saveDataUrlFile({
                dataUrl: payload.idBackImg,
                ownerType: 'doctors',
                ownerId: doctorId,
                ownerName: fullName,
                bucket: 'reports',
                label: 'id_back',
            });
        }
        if (isDataUrl(payload.graduation)) {
            payload.graduation = saveDataUrlFile({
                dataUrl: payload.graduation,
                ownerType: 'doctors',
                ownerId: doctorId,
                ownerName: fullName,
                bucket: 'reports',
                label: 'graduation',
            });
        }

        const newDoc = new Doctor(payload);
        const savedDoc = await newDoc.save();
        await VerificationDoctor.findOneAndUpdate(
            { doctor: savedDoc._id },
            {
                doctor: savedDoc._id,
                fullName: `${savedDoc.firstName || ''} ${savedDoc.lastName || ''}`.trim(),
                medicalSpecialty: savedDoc.medicalSpecialty || '',
                selfImg: savedDoc.selfImg || '',
                status: 'pending',
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Best effort: ensure a User row exists for this doctor (needed for notifications/messages).
        ensureUserForDoctorProfile(savedDoc._id).catch(() => null);
        notifyAdminAndSuperAdminUsers({
            type: 'system',
            title: 'New doctor request',
            message: `${savedDoc.firstName || 'A doctor'} ${savedDoc.lastName || ''}`.trim() + ' submitted a verification request.',
            actionUrl: '/admin/check-doctor-dashboard',
        }).catch(() => null);
        res.status(201).json(sanitizeDoctor(savedDoc));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDoctors = async (req, res) => {
    try {
        let patientProfileId =
            req.query.patientProfileId || req.query.patientId || req.authUser?.patient || null;

        // If the user is authenticated but missing the Patient link, fix it and decorate.
        if (!patientProfileId && req.authUser?._id) {
            const linked = await ensurePatientProfileLinked(req.authUser._id, {
                email: req.authUser.email,
                name: req.authUser.name,
            }).catch(() => null);
            patientProfileId = linked?.patient || patientProfileId;
        }
        const resolvedPid = await resolvePatientProfileId(patientProfileId);
        const docs = await Doctor.find().select('-password');
        // Always decorate: returns averageRating/ratingCount even for guests.
        const data = docs.map((d) => decorateDoctor(d, resolvedPid));
        res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.followDoctor = async (req, res) => {
    try {
        const lookup = buildDoctorLookup(req.params.id);
        const doctor = lookup ? await Doctor.findOne(lookup) : null;
        if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
        const role = String(req.authUser?.role || '').trim().toLowerCase();
        let patientId = role === 'patient' ? req.authUser?.patient : (req.body.patientId || req.authUser?.patient);

        // Some installs have User rows not linked to Patient yet; fix it on-demand.
        if (!patientId && req.authUser?._id) {
            const linked = await ensurePatientProfileLinked(req.authUser._id, {
                email: req.authUser.email,
                name: req.authUser.name,
            }).catch(() => null);
            patientId = linked?.patient || patientId;
        }
        patientId = await resolvePatientProfileId(patientId);
        if (!patientId) {
            return res.status(400).json({ success: false, error: 'Patient ID required' });
        }
        const pid = String(patientId);
        let followers = Array.isArray(doctor.followers) ? [...doctor.followers] : [];
        const has = followers.map(String).includes(pid);
        const explicit = req.body.follow;
        const shouldFollow = typeof explicit === 'boolean' ? explicit : !has;
        if (shouldFollow && !has) followers.push(patientId);
        if (!shouldFollow && has) followers = followers.filter((id) => String(id) !== pid);
        doctor.followers = followers;
        await doctor.save();
        const patient = await Patient.findById(patientId).select('firstName lastName').lean();
        if (patient?._id) {
            await Patient.findByIdAndUpdate(patientId, {
                DRFollow: shouldFollow ? 'follow' : 'unfollow',
            }).catch(() => null);
        }
        const doctorUser = await ensureUserForDoctorProfile(doctor._id);
        const patientUser = await ensureUserForPatientProfile(patientId);
        const patientName = `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || 'A patient';
        await notifyUsers([
            patientUser?._id
                ? {
                      user: patientUser._id,
                      type: 'follow',
                      title: shouldFollow ? 'Following updated' : 'Doctor unfollowed',
                      actionUrl: `/doctor-view/${String(doctor._id)}`,
                      message: shouldFollow
                          ? `You are now following Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
                          : `You are no longer following Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
                  }
                : null,
            shouldFollow && doctorUser?._id
                ? {
                      user: doctorUser._id,
                      type: 'follow',
                      title: 'New follower',
                      actionUrl: `/profile-patient/${String(patientId)}`,
                      message: `${patientName} started following your profile.`,
                  }
                : null,
        ]);
        const fresh = await Doctor.findById(doctor._id)
            .select('-password')
            .populate('patientRatings.patient', 'firstName lastName profileImage');
        res.status(200).json({
            success: true,
            isFollowing: shouldFollow,
            data: decorateDoctor(fresh, patientId),
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.rateDoctor = async (req, res) => {
    try {
        const lookup = buildDoctorLookup(req.params.id);
        const doctor = lookup ? await Doctor.findOne(lookup) : null;
        if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
        const role = String(req.authUser?.role || '').trim().toLowerCase();
        let patientId = role === 'patient' ? req.authUser?.patient : (req.body.patientId || req.authUser?.patient);

        // Some installs have User rows not linked to Patient yet; fix it on-demand.
        if (!patientId && req.authUser?._id) {
            const linked = await ensurePatientProfileLinked(req.authUser._id, {
                email: req.authUser.email,
                name: req.authUser.name,
            }).catch(() => null);
            patientId = linked?.patient || patientId;
        }
        patientId = await resolvePatientProfileId(patientId);
        const value = Number(req.body.rating ?? req.body.value);
        if (!patientId || !Number.isFinite(value) || value < 1 || value > 5) {
            return res.status(400).json({
                success: false,
                error: 'Patient ID and rating between 1 and 5 are required',
            });
        }
        const ratings = Array.isArray(doctor.patientRatings) ? [...doctor.patientRatings] : [];
        const idx = ratings.findIndex((r) => String(r.patient) === String(patientId));
        const entry = { patient: patientId, value, updatedAt: new Date() };
        if (idx >= 0) ratings[idx] = entry;
        else ratings.push(entry);
        doctor.patientRatings = ratings;
        await doctor.save();
        const patient = await Patient.findById(patientId).select('firstName lastName').lean();
        const doctorUser = await ensureUserForDoctorProfile(doctor._id);
        const patientUser = await ensureUserForPatientProfile(patientId);
        const patientName = `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || 'A patient';
        await notifyUsers([
            doctorUser?._id
                ? {
                      user: doctorUser._id,
                      type: 'rating',
                      title: 'New doctor rating',
                      actionUrl: `/profile-patient/${String(patientId)}`,
                      message: `${patientName} rated you ${value}/5.`,
                  }
                : null,
            patientUser?._id
                ? {
                      user: patientUser._id,
                      type: 'rating',
                      title: 'Rating saved',
                      actionUrl: `/doctor-view/${String(doctor._id)}`,
                      message: `Your ${value}/5 rating for Dr. ${doctor.firstName || ''} ${doctor.lastName || ''} has been saved.`.trim(),
                  }
                : null,
        ]);
        const fresh = await Doctor.findById(doctor._id)
            .select('-password')
            .populate('patientRatings.patient', 'firstName lastName profileImage');
        res.status(200).json({ success: true, data: decorateDoctor(fresh, patientId) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDoctorMeta = async (req, res) => {
    try {
        res.status(200).json({
            universities: Doctor.getUniversities(),
            specialties: Doctor.getSpecialties(),
            governorates: Doctor.getGovernorates(),
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDoctorById = async (req, res) => {
    try {
        const lookup = buildDoctorLookup(req.params.id);
        const doc = lookup
            ? await Doctor.findOne(lookup)
                .select('-password')
                .populate('patientRatings.patient', 'firstName lastName profileImage')
            : null;
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
        const patientIdRaw = req.query.patientProfileId || req.query.patientId || req.authUser?.patient || null;
        const patientId = await resolvePatientProfileId(patientIdRaw);
        res.status(200).json({ success: true, data: decorateDoctor(doc, patientId) });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.updateDoctor = async (req, res) => {
    try {
        const lookup = buildDoctorLookup(req.params.id);
        const currentDoc = lookup ? await Doctor.findOne(lookup).select('_id firstName lastName') : null;
        if (!currentDoc) return res.status(404).json({ success: false, error: 'Not found' });

        const fullName = `${req.body.firstName || currentDoc.firstName || ''} ${req.body.lastName || currentDoc.lastName || ''}`.trim() || 'doctor';
        const updates = { ...req.body };

        if (isDataUrl(updates.profileImage)) {
            updates.profileImage = saveDataUrlFile({
                dataUrl: updates.profileImage,
                ownerType: 'doctors',
                ownerId: currentDoc._id,
                ownerName: fullName,
                bucket: 'images',
                label: 'profile',
            });
        }
        if (isDataUrl(updates.selfImg)) {
            updates.selfImg = saveDataUrlFile({
                dataUrl: updates.selfImg,
                ownerType: 'doctors',
                ownerId: currentDoc._id,
                ownerName: fullName,
                bucket: 'images',
                label: 'selfie',
            });
        }
        if (isDataUrl(updates.idFrontImg)) {
            updates.idFrontImg = saveDataUrlFile({
                dataUrl: updates.idFrontImg,
                ownerType: 'doctors',
                ownerId: currentDoc._id,
                ownerName: fullName,
                bucket: 'reports',
                label: 'id_front',
            });
        }
        if (isDataUrl(updates.idBackImg)) {
            updates.idBackImg = saveDataUrlFile({
                dataUrl: updates.idBackImg,
                ownerType: 'doctors',
                ownerId: currentDoc._id,
                ownerName: fullName,
                bucket: 'reports',
                label: 'id_back',
            });
        }
        if (isDataUrl(updates.graduation)) {
            updates.graduation = saveDataUrlFile({
                dataUrl: updates.graduation,
                ownerType: 'doctors',
                ownerId: currentDoc._id,
                ownerName: fullName,
                bucket: 'reports',
                label: 'graduation',
            });
        }

        const doc = await Doctor.findOneAndUpdate(lookup, updates, {
            new: true,
            runValidators: true,
            select: '-password',
        });
        if (!doc) return res.status(404).json({ success: false, error: 'Not found' });

        // Best effort: sync User row to reflect updated name/image/etc.
        try {
            await User.findOneAndUpdate(
                { doctor: doc._id },
                {
                    name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || undefined,
                    image: doc.profileImage || undefined,
                    ...(doc.email ? { email: String(doc.email).toLowerCase() } : {}),
                    role: doc.role || undefined,
                },
                { new: true }
            );
        } catch {
            // ignore
        }
        res.status(200).json({ success: true, data: doc });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const lookup = buildDoctorLookup(req.params.id);
        const doc = lookup ? await Doctor.findOneAndDelete(lookup) : null;
        if (!doc) return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// Search doctors by name, specialty, or other fields
exports.searchDoctors = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ 
                success: false,
                error: 'Search query is required' 
            });
        }

        // Search in name, specialty, university, etc.
        const doctors = await Doctor.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { specialty: { $regex: query, $options: 'i' } },
                { university: { $regex: query, $options: 'i' } },
                { governorate: { $regex: query, $options: 'i' } },
                { clinicName: { $regex: query, $options: 'i' } }
            ]
        }).select('-password');

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (err) { 
        res.status(500).json({ 
            success: false,
            error: err.message 
        }); 
    }
};
