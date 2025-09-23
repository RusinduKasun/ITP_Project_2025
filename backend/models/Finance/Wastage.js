import mongoose from 'mongoose';

const wastageSchema = new mongoose.Schema({
  fruitType: {
    type: String,
    required: true,
    enum: ['Jackfruit', 'Wood Apple', 'Durian', 'Banana', 'Other']
  },
  category: {
    type: String,
    required: true,
    enum: ['Collection/Transport', 'Stocking/Storage', 'Processing/Production']
  },
  specificReason: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  wastageCost: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate wastage cost before saving
wastageSchema.pre('save', function(next) {
  this.wastageCost = this.quantity * this.unitPrice;
  next();
});

// Virtual field for total cost calculation
wastageSchema.virtual('totalCost').get(function() {
  return this.quantity * this.unitPrice;
});

const Wastage = mongoose.model('Wastage', wastageSchema);

export default Wastage;