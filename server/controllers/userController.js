const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { ensurePatientProfileLinked } = require('../utils/ensurePatientLink');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const VerificationDoctor = require('../models/VerificationDoctor');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isDataUrl, saveDataUrlFile } = require('../utils/fileStorage');
const { sendOtpEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const OTP_EXPIRES_MINUTES = 10;

// --- Helper Functions ---

const signToken = (user) => {
    const u = user.toObject ? user.toObject() : user;
    return jwt.sign(
        {
            id: u._id,
            role: u.role,
            email: u.email,
            patientProfileId: u.patient ? String(u.patient) : null,
            doctorProfileId: u.doctor ? String(u.doctor) : null,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const normalizePresence = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'online' ? 'online' : 'offline';
};

const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;
    return user;
};

const comparePasswordSafe = async (enteredPassword, storedPassword) => {
    if (!storedPassword) return false;
    try {
        const matched = await bcrypt.compare(enteredPassword, storedPassword);
        if (matched) return true;
        // Fallback for plain-text legacy passwords (if applicable)
        return enteredPassword === storedPassword;
    } catch (error) {
        return false;
    }
};

const createOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const resolvePasswordResetUserByEmail = async (email) => {
    const loweredEmail = String(email || '').trim().toLowerCase();
    if (!loweredEmail) return null;

    let user = await User.findOne({ email: loweredEmail });
    if (!user || String(user.role || '').trim().toLowerCase() === 'guest' || (!user.patient && !user.doctor)) {
        const synced = await syncUserFromLinkedCollections(loweredEmail);
        if (synced) user = synced;
    }

    if (!user) return null;

    const normalizedRole = String(user.role || '').trim().toLowerCase();
    if (normalizedRole !== 'patient' && normalizedRole !== 'doctor') {
        return null;
    }

    return user;
};

const syncPasswordAcrossLinkedAccounts = async (user, plainPassword) => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const updates = [User.findByIdAndUpdate(user._id, { password: hashedPassword })];

    const role = String(user.role || '').trim().toLowerCase();
    if (role === 'patient' && user.patient) {
        updates.push(Patient.findByIdAndUpdate(user.patient, { password: hashedPassword }));
    }
    if (role === 'doctor' && user.doctor) {
        updates.push(Doctor.findByIdAndUpdate(user.doctor, { password: hashedPassword }));
    }

    await Promise.all(updates);
};

const syncUserFromLinkedCollections = async (email) => {
    const loweredEmail = email.toLowerCase();

    // Check Admin
    const admin = await Admin.findOne({ email: loweredEmail });
    if (admin) {
        return User.findOneAndUpdate(
            { email: loweredEmail },
            {
                admin: admin._id,
                name: admin.name,
                role: admin.role || 'Admin',
                image: admin.Image || '',
                email: loweredEmail,
                password: admin.password,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    }

    // Check SuperAdmin
    const superAdmin = await SuperAdmin.findOne({ email: loweredEmail });
    if (superAdmin) {
        return User.findOneAndUpdate(
            { email: loweredEmail },
            {
                superAdmin: superAdmin._id,
                name: superAdmin.name,
                role: superAdmin.role || 'Super Admin',
                image: superAdmin.Image || '',
                email: loweredEmail,
                password: superAdmin.password,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    }

    // Check Doctor
    const doctor = await Doctor.findOne({ email: loweredEmail });
    if (doctor) {
        return User.findOneAndUpdate(
            { email: loweredEmail },
            {
                doctor: doctor._id,
                name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
                role: doctor.role || 'Doctor',
                image: doctor.profileImage || '',
                email: loweredEmail,
                password: doctor.password,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    }

    // Check Patient
    const patient = await Patient.findOne({ email: loweredEmail });
    if (patient) {
        return User.findOneAndUpdate(
            { email: loweredEmail },
            {
                patient: patient._id,
                name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
                role: patient.role || 'Patient',
                image: patient.profileImage || '',
                email: loweredEmail,
                password: patient.password,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
    }

    return null;
};

const setPresenceStatus = async (userDoc, nextStatus) => {
    if (!userDoc?._id) return;

    const normalizedStatus = normalizePresence(nextStatus);
    const update = { status: normalizedStatus };
    if (normalizedStatus === 'online') update.lastSeenAt = new Date();
    if (normalizedStatus === 'offline') update.lastSeenAt = null;
    await User.findByIdAndUpdate(userDoc._id, update);

    const role = String(userDoc.role || '').trim().toLowerCase();
    const capitalized = normalizedStatus === 'online' ? 'Online' : 'Offline';

    const updateData = { status: capitalized }; // Generic field name
    const updateDataCapital = { Status: capitalized }; // Legacy capitalized field name

    if (role === 'patient' && userDoc.patient) {
        await Patient.findByIdAndUpdate(userDoc.patient, updateDataCapital);
    } else if (role === 'doctor' && userDoc.doctor) {
        await Doctor.findByIdAndUpdate(userDoc.doctor, updateDataCapital);
    } else if (role === 'admin' && userDoc.admin) {
        await Admin.findByIdAndUpdate(userDoc.admin, updateData);
    } else if (role.includes('superadmin') && userDoc.superAdmin) {
        await SuperAdmin.findByIdAndUpdate(userDoc.superAdmin, updateData);
    }
};

const buildFreshUserView = (userDoc) => {
    const patient = userDoc.patient && typeof userDoc.patient === 'object' ? userDoc.patient : null;
    const doctor = userDoc.doctor && typeof userDoc.doctor === 'object' ? userDoc.doctor : null;
    const admin = userDoc.admin && typeof userDoc.admin === 'object' ? userDoc.admin : null;
    const superAdmin = userDoc.superAdmin && typeof userDoc.superAdmin === 'object' ? userDoc.superAdmin : null;

    let computedName = userDoc.name || '';
    let computedImage = userDoc.image || '';
    let computedRole = userDoc.role || '';
    let computedJoinDate = userDoc.joinDate || userDoc.createdAt || null;

    if (patient) {
        computedName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || computedName;
        computedImage = patient.profileImage || computedImage;
        computedRole = patient.role || computedRole;
        computedJoinDate = patient.joinDate || computedJoinDate;
    } else if (doctor) {
        computedName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || computedName;
        computedImage = doctor.profileImage || doctor.selfImg || computedImage;
        computedRole = doctor.role || computedRole;
        computedJoinDate = doctor.joinDate || computedJoinDate;
    } else if (admin) {
        computedName = admin.name || computedName;
        computedImage = admin.Image || computedImage;
        computedRole = admin.role || computedRole;
        computedJoinDate = admin.joinDate || computedJoinDate;
    } else if (superAdmin) {
        computedName = superAdmin.name || computedName;
        computedImage = superAdmin.Image || computedImage;
        computedRole = superAdmin.role || computedRole;
        computedJoinDate = superAdmin.joinDate || computedJoinDate;
    }

    const freshUser = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    freshUser.name = computedName;
    freshUser.image = computedImage;
    freshUser.role = computedRole;
    freshUser.joinDate = computedJoinDate;
    delete freshUser.password;
    return freshUser;
};

// --- Controllers ---

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .populate('patient', 'firstName lastName profileImage role Status joinDate email')
            .populate('doctor', 'firstName lastName profileImage selfImg role Status joinDate email medicalSpecialty')
            .populate('admin', 'name Image role status joinDate email')
            .populate('superAdmin', 'name Image role status joinDate')
            .sort({ createdAt: -1 });

        const freshUsers = users.map(buildFreshUserView);
        res.status(200).json({ success: true, count: freshUsers.length, data: freshUsers });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('patient', 'firstName lastName profileImage role Status joinDate email')
            .populate('doctor', 'firstName lastName profileImage selfImg role Status joinDate email medicalSpecialty')
            .populate('admin', 'name Image role status joinDate email')
            .populate('superAdmin', 'name Image role status joinDate');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: buildFreshUserView(user) });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            name, 
            email: email.toLowerCase(), 
            password: hashedPassword, 
            role 
        });
        res.status(201).json({ success: true, data: sanitizeUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role = 'Guest' } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedRole = String(role || 'Guest').trim().toLowerCase();
        const forbiddenRoles = ['admin', 'super admin', 'superadmin', 'subadmin'];
        
        if (forbiddenRoles.includes(normalizedRole)) {
            return res.status(403).json({
                success: false,
                message: 'This role is not allowed via public registration',
            });
        }

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({
            name: name || email.split('@')[0],
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
        });

        const token = signToken(createdUser);
        return res.status(201).json({
            success: true,
            data: { token, user: sanitizeUser(createdUser) },
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const loweredEmail = email.toLowerCase();
        
        // --- DEDUPLICATION LOGIC ---
        // Find all users with this email. If more than one, keep the one with most profiles or the oldest one.
        const allUsers = await User.find({ email: loweredEmail }).sort({ createdAt: 1 });
        if (allUsers.length > 1) {
            const bestUser = allUsers.find(u => u.patient || u.doctor || u.admin) || allUsers[0];
            const others = allUsers.filter(u => String(u._id) !== String(bestUser._id));
            // Move any important fields to bestUser if missing
            let changed = false;
            for (const other of others) {
                if (!bestUser.patient && other.patient) { bestUser.patient = other.patient; changed = true; }
                if (!bestUser.doctor && other.doctor) { bestUser.doctor = other.doctor; changed = true; }
                if (!bestUser.admin && other.admin) { bestUser.admin = other.admin; changed = true; }
                
                // --- MERGE CHATS ---
                // Update all chats where 'other' was a participant to use 'bestUser'
                const Chat = mongoose.model('Chat');
                await Chat.updateMany(
                    { participants: other._id },
                    { $set: { "participants.$": bestUser._id } }
                );
                // Update all messages
                const Message = mongoose.model('Message');
                await Message.updateMany({ sender: other._id }, { $set: { sender: bestUser._id } });

                // Delete the duplicate
                await User.deleteOne({ _id: other._id });
            }
            if (changed) await bestUser.save();
        }

        let user = await User.findOne({ email: loweredEmail });
        
        // If user not found OR user is a Guest (may have upgraded) OR user is missing profiles
        if (!user || user.role === 'Guest' || (!user.patient && !user.doctor)) {
            const synced = await syncUserFromLinkedCollections(loweredEmail);
            if (synced) {
                user = synced;
            }
        }

        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isValid = await comparePasswordSafe(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const normalizedUserRole = String(user.role || '').trim().toLowerCase();
        if (normalizedUserRole === 'doctor') {
            let verification = null;
            if (user.doctor) {
                verification = await VerificationDoctor.findOne({ doctor: user.doctor })
                    .sort({ createdAt: -1 })
                    .lean();
            }
            if (!verification || verification.status !== 'accepted') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is pending approval. if you have a problem contact us',
                });
            }
        }

        await ensurePatientProfileLinked(user._id, { email: loweredEmail, name: user.name });
        user = await User.findById(user._id);
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = signToken(user);
        await setPresenceStatus(user, 'online');
        
        const freshUser = await User.findById(user._id).select('-password');
        return res.status(200).json({
            success: true,
            data: { token, user: freshUser },
        });
    } catch (error) {
        next(error);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.authUser?._id || req.body?.userId;
        if (userId) {
            const user = await User.findById(userId);
            if (user) await setPresenceStatus(user, 'offline');
        }
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

const sendPasswordResetOtp = async (req, res, next) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await resolvePasswordResetUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Only patient and doctor accounts can request OTP reset',
            });
        }

        const otp = createOtpCode();
        const codeHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

        await PasswordResetOtp.deleteMany({ user: user._id, consumedAt: null });
        await PasswordResetOtp.create({
            user: user._id,
            email,
            role: user.role || '',
            codeHash,
            expiresAt,
        });

        await sendOtpEmail({
            to: email,
            recipientName: user.name || email.split('@')[0],
            otp,
            roleLabel: String(user.role || '').trim() || 'Account',
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            expiresInMinutes: OTP_EXPIRES_MINUTES,
        });
    } catch (error) {
        next(error);
    }
};

const verifyPasswordResetOtp = async (req, res, next) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const otp = String(req.body?.otp || '').trim();
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const record = await PasswordResetOtp.findOne({
            email,
            consumedAt: null,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!record) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or expired' });
        }

        const matched = await bcrypt.compare(otp, record.codeHash);
        if (!matched) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ success: false, message: 'OTP is invalid or expired' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        next(error);
    }
};

const resetPasswordWithOtp = async (req, res, next) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const otp = String(req.body?.otp || '').trim();
        const newPassword = String(req.body?.newPassword || '');

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const record = await PasswordResetOtp.findOne({
            email,
            consumedAt: null,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!record) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or expired' });
        }

        const matched = await bcrypt.compare(otp, record.codeHash);
        if (!matched) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ success: false, message: 'OTP is invalid or expired' });
        }

        const user = await User.findById(record.user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await syncPasswordAcrossLinkedAccounts(user, newPassword);
        record.consumedAt = new Date();
        await record.save();
        await PasswordResetOtp.deleteMany({ user: user._id, consumedAt: null });

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;

        // 1. Prevent self-deletion
        if (req.user && req.user.id === targetUserId) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account." });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Safeguard SuperAdmins from accidental deletion
        if (user.role.toLowerCase().includes('superadmin')) {
            return res.status(403).json({ success: false, message: "Super Admin accounts cannot be deleted." });
        }

        // 3. Perform Cascade Deletion
        const deletionPromises = [];
        if (user.patient) deletionPromises.push(Patient.findByIdAndDelete(user.patient));
        if (user.doctor) deletionPromises.push(Doctor.findByIdAndDelete(user.doctor));
        if (user.admin) deletionPromises.push(Admin.findByIdAndDelete(user.admin));
        if (user.superAdmin) deletionPromises.push(SuperAdmin.findByIdAndDelete(user.superAdmin));

        await Promise.allSettled(deletionPromises);
        await User.findByIdAndDelete(targetUserId);

        res.status(200).json({ success: true, message: 'User and all linked data deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const authUserId = req.user?.id || req.authUser?._id;
        const requesterRole = String(req.user?.role || req.authUser?.role || '').trim().toLowerCase();
        const isAdminRequester =
            requesterRole === 'admin' ||
            requesterRole === 'super admin' ||
            requesterRole === 'superadmin';

        if (!authUserId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!isAdminRequester && String(authUserId) !== String(targetUserId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const allowedText = (value) => String(value || '').trim();
        const nextFirstName = allowedText(req.body.firstName);
        const nextLastName = allowedText(req.body.lastName);
        const nextPhoneNumber = allowedText(req.body.phoneNumber || req.body.phone);
        const nextProfileImage = allowedText(req.body.profileImage || req.body.image);

        if (user.patient) {
            const updates = {};
            if (nextFirstName) updates.firstName = nextFirstName;
            if (nextLastName) updates.lastName = nextLastName;
            if (nextPhoneNumber) updates.phone = nextPhoneNumber;
            if (nextProfileImage) {
                updates.profileImage = isDataUrl(nextProfileImage)
                    ? saveDataUrlFile({
                          dataUrl: nextProfileImage,
                          ownerType: 'patients',
                          ownerId: user.patient,
                          ownerName: `${nextFirstName || user.name || ''} ${nextLastName || ''}`.trim() || 'patient',
                          bucket: 'images',
                          label: 'profile',
                      })
                    : nextProfileImage;
            }
            await Patient.findByIdAndUpdate(user.patient, updates, {
                new: true,
                runValidators: true,
            });
        } else if (user.doctor) {
            const updates = {};
            if (nextFirstName) updates.firstName = nextFirstName;
            if (nextLastName) updates.lastName = nextLastName;
            if (nextPhoneNumber) updates.phoneNumber = nextPhoneNumber;
            if (nextProfileImage) {
                updates.profileImage = isDataUrl(nextProfileImage)
                    ? saveDataUrlFile({
                          dataUrl: nextProfileImage,
                          ownerType: 'doctors',
                          ownerId: user.doctor,
                          ownerName: `${nextFirstName || user.name || ''} ${nextLastName || ''}`.trim() || 'doctor',
                          bucket: 'images',
                          label: 'profile',
                      })
                    : nextProfileImage;
            }
            await Doctor.findByIdAndUpdate(user.doctor, updates, {
                new: true,
                runValidators: true,
            });
        } else {
            const updates = {};
            if (nextProfileImage) updates.image = nextProfileImage;
            if (nextFirstName || nextLastName) {
                updates.name = `${nextFirstName} ${nextLastName}`.trim();
            }
            await User.findByIdAndUpdate(user._id, updates, { new: true });
        }

        const linkedName = `${nextFirstName} ${nextLastName}`.trim();
        const userUpdates = {};
        if (linkedName) userUpdates.name = linkedName;
        if (nextProfileImage) userUpdates.image = nextProfileImage;

        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(user._id, userUpdates, { new: true });
        }

        const freshUser = await User.findById(user._id)
            .populate('patient', 'firstName lastName profileImage role Status joinDate email phone')
            .populate('doctor', 'firstName lastName profileImage selfImg role Status joinDate email phoneNumber medicalSpecialty')
            .populate('admin', 'name Image role status joinDate email')
            .populate('superAdmin', 'name Image role status joinDate');

        return res.status(200).json({
            success: true,
            data: buildFreshUserView(freshUser),
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser,
    deleteUser, 
    registerUser, 
    loginUser, 
    logoutUser,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp,
};
