const express = require('express');
const router = express.Router();
const {
    createShopItem,
    getShopItems,
    getShopItemById,
    deleteShopItem
} = require('../controllers/shopController');

router.route('/')
    .get(getShopItems)
    .post(createShopItem);

router.route('/:id')
    .get(getShopItemById)
    .delete(deleteShopItem);

module.exports = router;
