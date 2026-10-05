const express = require('express');
const router = express.Router();
const {
    createSuperAdmin,
    getSuperAdmins,
    getSuperAdminById,
    updateSuperAdmin,
    deleteSuperAdmin
} = require('../controllers/superadminController');

router.route('/')
    .get(getSuperAdmins)
    .post(createSuperAdmin);

router.route('/:id')
    .get(getSuperAdminById)
    .put(updateSuperAdmin)
    .delete(deleteSuperAdmin);

module.exports = router;
