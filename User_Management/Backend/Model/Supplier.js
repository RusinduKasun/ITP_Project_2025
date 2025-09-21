const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  fruit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }
}, { _id: false });

const SupplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  fruits: [{ type: String }],
  priceList: [PriceSchema],
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    branch: { type: String }
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Inactive'],
    default: 'Active'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);