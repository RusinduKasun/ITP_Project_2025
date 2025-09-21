const Order = require('../../Model/Model-nadula/OrderManagementModel');

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { orderId, customerName, customerEmail, items = [], totalAmount = 0, status, notes } = req.body;
    const order = await Order.create({ orderId, customerName, customerEmail, items, totalAmount, status, notes });
    return res.status(201).json({ order });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Get by id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    return res.json({ order });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
};
