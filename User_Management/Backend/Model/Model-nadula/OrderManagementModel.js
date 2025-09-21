const mongoose = require('mongoose');

const OrderManagementSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    items: [
      {
        name: { type: String, required: true },
        sku: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 }
      }
    ],
    totalAmount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    notes: { type: String }
  },
  {
    timestamps: true,
    collection: 'order_management'
  }
);

module.exports = mongoose.model('OrderManagement', OrderManagementSchema);
