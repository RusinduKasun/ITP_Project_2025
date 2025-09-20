import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
  fruitName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg'],
    default: 'kg'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  supplierBatchNumber: {
    type: String,
    required: [true, 'Supplier batch number is required']
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['In Stock', 'Low Stock', 'Out of Stock']
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  stockThreshold: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('RawMaterial', rawMaterialSchema);
