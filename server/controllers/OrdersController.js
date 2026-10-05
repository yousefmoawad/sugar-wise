// 📦 Orders Controller - Handle order operations
const Order = require('../models/Order');

// Get all orders (Admin view)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .populate('promoCode', 'promoCodeName discount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .populate('promoCode', 'promoCodeName discount');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order'
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, shippingAddress, paymentMethod, promoCode } = req.body;

    if (!userId || !items || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'User ID, items, and total price are required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items must be a non-empty array'
      });
    }

    const newOrder = new Order({
      user: userId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'credit_card',
      promoCode: promoCode || null
    });

    await newOrder.save();
    await newOrder.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .populate('promoCode', 'promoCodeName discount');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order'
    });
  }
};

// Update order status (PATCH endpoint for status updates)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .populate('promoCode', 'promoCodeName discount');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete order'
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .populate('promoCode', 'promoCodeName discount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      message: 'User orders retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve user orders'
    });
  }
};
