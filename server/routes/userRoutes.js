const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticateToken, logoutUser);
router.post('/forgot-password/send-otp', sendPasswordResetOtp);
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);

// /api/users
router.route('/').get(getUsers).post(createUser);
router.route('/:id')
    .get(getUserById)
    .put(authenticateToken, updateUser)
    .delete(authenticateToken, authorizeRole(['admin', 'super admin', 'superadmin']), deleteUser);

module.exports = router;
