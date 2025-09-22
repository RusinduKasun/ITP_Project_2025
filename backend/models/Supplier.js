import mongoose from 'mongoose';

const PriceSchema = new mongoose.Schema({
  fruit: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }
}, { _id: false });
// Add timestamps to track creation and updates
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
// Add timestamps to track creation and updates
export default mongoose.model('Supplier', SupplierSchema);