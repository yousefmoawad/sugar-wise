const express = require('express');
const router = express.Router();
const {
    createInsulinUnit,
    getInsulinUnits,
    getInsulinUnitById,
    updateInsulinUnit,
    deleteInsulinUnit
} = require('../controllers/insulinunitsController');

router.route('/')
    .get(getInsulinUnits)
    .post(createInsulinUnit);

router.route('/:id')
    .get(getInsulinUnitById)
    .put(updateInsulinUnit)
    .delete(deleteInsulinUnit);

module.exports = router;
