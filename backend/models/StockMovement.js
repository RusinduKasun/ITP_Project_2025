import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  friendlyId: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Inbound', 'Outbound']
  },
  item: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Raw Material', 'Finished Product'],
    default: 'Raw Material'
  },
  source: {
    type: String,
    required: true,
    default: 'Manual Entry'
  },
  quantity: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: false
  },
  reason: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add pre-save middleware to generate friendly ID
stockMovementSchema.pre('save', async function(next) {
  if (!this.friendlyId) {
    try {
      // Find the highest existing friendlyId number
      const lastDoc = await this.constructor.findOne(
        {},
        { friendlyId: 1 },
        { sort: { friendlyId: -1 } }
      );
      
      let nextNumber = 1;
      if (lastDoc && lastDoc.friendlyId) {
        const match = lastDoc.friendlyId.match(/^SM-(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Generate simple sequential ID
      this.friendlyId = `SM-${nextNumber}`;
    } catch (error) {
      console.error('Error generating friendlyId:', error);
      // If there's an error, get total count as fallback
      const count = await this.constructor.countDocuments();
      this.friendlyId = `SM-${count + 1}`;
    }
  }
  next();
});

export default mongoose.model('StockMovement', stockMovementSchema);
