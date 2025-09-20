import mongoose from 'mongoose';

const finishedProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['beverages', 'snacks', 'others'],
      message: 'Category must be either beverages, snacks, or others'
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['ml', 'L', 'g', 'Kg'],
      message: 'Unit must be ml, L, g, or Kg'
    }
  },
  packageSize: {
    type: String,
    required: [true, 'Package size is required'],
    enum: {
      values: ['250ml', '500ml', '1L', '250g', '500g', '1Kg'],
      message: 'Invalid package size'
    }
  },
  productionDate: {
    type: Date,
    required: [true, 'Production date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Production date cannot be in the future'
    }
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > this.productionDate;
      },
      message: 'Expiry date must be after production date'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['In Production', 'Ready to ship', 'Completed', 'Available'],
      message: 'Status must be In Production, Ready to ship, Completed, or Available'
    },
    default: 'In Production'
  },
  productionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Production',
    required: false
  },
  batch: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    default: function() {
      return 'FP-' + Date.now();
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to format dates before saving
finishedProductSchema.pre('save', function(next) {
  if (this.productionDate) {
    this.productionDate = new Date(this.productionDate);
  }
  if (this.expiryDate) {
    this.expiryDate = new Date(this.expiryDate);
  }
  next();
});

// Create compound index for productName and batch
finishedProductSchema.index({ productName: 1, batch: 1 }, { unique: true });

const FinishedProduct = mongoose.model('FinishedProduct', finishedProductSchema);

export default FinishedProduct;
