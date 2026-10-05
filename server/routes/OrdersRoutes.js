const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getUserOrders
} = require('../controllers/OrdersController');

// /api/orders
router.route('/').get(getOrders).post(createOrder);

// /api/orders/user - Get user's orders
router.get('/user', getUserOrders);

// /api/orders/:id
router.route('/:id').get(getOrderById).put(updateOrder).delete(deleteOrder);

// /api/orders/:id/status - Update order status (PATCH)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
