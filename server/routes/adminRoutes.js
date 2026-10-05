const express = require('express');
const router = express.Router();
const {
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} = require('../controllers/AdminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const onlyAdmin = [authenticateToken, authorizeRole(['Admin', 'Super Admin'])];

router.route('/')
    .get(...onlyAdmin, getAdmins)
    .post(...onlyAdmin, createAdmin);

router.route('/:id')
    .get(...onlyAdmin, getAdminById)
    .put(...onlyAdmin, updateAdmin)
    .delete(...onlyAdmin, deleteAdmin);

module.exports = router;
