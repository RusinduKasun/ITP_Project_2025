import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    unique: true
  },

  itemName: { 
    type: String, 
    required: [true, 'Item name is required']
  },    

  category: { 
    type: String ,  
    enum: ['Fresh', 'Frozen'], 
    default: 'Fresh'  
  },
                         
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
              
  unit: { 
    type: String, 
    enum: ['kg', 'pcs', 'box'], 
    default: 'kg' 
  },

  reorderLevel: { 
    type: Number, 
    default: 10,
    min: [0, 'Reorder level cannot be negative']
  },
             
  supplierName: { 
    type: String, 
  },

  dateOfArrival: { 
    type: Date, 
    default: Date.now 
  },

  expiryDate: { 
    type: Date,
    // validate: {
    //   validator: function(value) {
    //     return !value || value > this.dateOfArrival;
    //   },
    //   message: 'Expiry date must be after the date of arrival'
    // }
  },

  purchasePrice: { 
    type: Number,
    min: [0, 'Price cannot be negative']
  } 
                        
},{ timestamps: true });

// Auto-generate itemCode like INV-0001
inventorySchema.pre("save", async function (next) {
  if (!this.itemCode) {
    const lastItem = await mongoose.model("Inventory").findOne().sort({ createdAt: -1 });
    let nextCode = 1;
    if (lastItem && lastItem.itemCode) {
      const lastNumber = parseInt(lastItem.itemCode.split("-")[1]);
      nextCode = lastNumber + 1;
    }
    this.itemCode = `INV-${String(nextCode).padStart(4, "0")}`;
  }
  next();
});

const inventoryModel = mongoose.model("Inventory", inventorySchema);
export default inventoryModel;
