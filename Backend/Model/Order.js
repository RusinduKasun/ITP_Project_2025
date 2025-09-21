// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  fruit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  deliveryDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  trackingStatus: {
    type: String,
    enum: ['Order Placed', 'Approved', 'In Transit', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed',
  },
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);