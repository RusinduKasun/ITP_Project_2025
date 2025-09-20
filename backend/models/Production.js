import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    default: () => 'PROD-' + Date.now()
  },
  productName: { type: String, required: true, trim: true },
  productType: { 
    type: String, 
    required: true,
    enum: ['Chips','Noodles','Jam','Juice','Syrup','Cordial','Raw Fruit']
  },
  category: { type: String, required: true, enum: ['beverages','snacks','others'] },
  unit: { type: String, required: true, enum: ['ml','L','g','Kg','packets','bottles'] },
  packageSize: { type: String, required: true, enum: ['250ml','500ml','1L','250g','500g','1Kg'] },
  startDate: { type: Date, required: true, validate: { validator: v => v <= new Date(), message: 'Start date cannot be in the future' } },
  expectedEndDate: { type: Date, required: true, validate: { validator: function(v){ return v > this.startDate }, message: 'Expected end date must be after start date' } },
  actualEndDate: { type: Date, validate: { validator: function(v){ return !v || v >= this.startDate }, message: 'Actual end date must be after start date' } },
  quantity: { type: Number, required: true, min: [0,'Quantity cannot be negative'] },
  status: { type: String, required: true, enum: ['Planned','In Progress','Completed','Cancelled'], default: 'Planned' },
  notes: { type: String, trim: true, maxLength: [500,'Notes cannot exceed 500 chars'] },
  rawMaterials: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg', enum: ['kg'] }
  }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productionSchema.virtual('isCompleted').get(function(){ return this.status === 'Completed' && this.actualEndDate != null });
productionSchema.virtual('isDelayed').get(function(){
  if(this.status === 'Completed') return this.actualEndDate > this.expectedEndDate;
  return this.status !== 'Cancelled' && new Date() > this.expectedEndDate;
});

productionSchema.index({ productName: 1, batchNumber: 1 }, { unique: true });

export default mongoose.model('Production', productionSchema);
