import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['LOW_STOCK', 'EXPIRED', 'PRODUCTION_COMPLETE', 'REORDER'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fruit',  // This matches the model name in fruitModel.js
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('InventoryNotification', notificationSchema);