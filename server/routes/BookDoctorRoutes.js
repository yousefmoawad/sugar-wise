const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
    createBookDoctor,
    getBookDoctors,
    getBookDoctorById,
    updateBookDoctor,
    deleteBookDoctor
} = require('../controllers/BookDoctorController');

router.use(optionalAuthenticateToken);

// /api/book-doctor
router.route('/').get(getBookDoctors).post(createBookDoctor);

// /api/book-doctor/:id
router.route('/:id').get(getBookDoctorById).put(updateBookDoctor).delete(deleteBookDoctor);

module.exports = router;
