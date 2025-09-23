import mongoose from "mongoose";

const productionSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true
  },

  productName: { 
    type: String, 
    required: [true, "Product name is required"]
  },
            
  category: { 
    type: String,
    enum: ['chips', 'noodles', 'cordial', 'rawfruit', 'jam', 'juice', 'syrup'], 
    required: [true, "Category is required"]
  },  
                            
ingredients: [{
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fruit', 
    required: [true, "Ingredient item is required"] 
  },
  name: { 
    type: String, 
    required: [true, "Ingredient name is required"] 
  },
  quantityUsed: { 
    type: Number, 
    min: [0, "Quantity used cannot be negative"], 
    required: true 
  },
  unit: { 
    type: String, 
    required: true 
  }
}],


  quantityProduced: { 
    type: Number, 
    required: [true, "Quantity produced is required"],
    min: [0, "Quantity cannot be negative"]
  },

  unit: { 
    type: String, 
    enum: ['bottle', 'jar', 'pack'], 
    default: 'pack' 
  },

  batchNumber: { 
    type: String, 
    unique: true,
    required: [true, "Batch number is required"]
  },

  productionDate: { 
    type: Date, 
    default: Date.now 
  },

  expiryDate: { 
    type: Date,
    // validate: {
    //   validator: function (value) {
    //     return !value || value > this.productionDate;
    //   },
    //   message: "Expiry date must be after production date"
    // }
  },

  costPerUnit: { 
    type: Number,
    min: [0, "Cost per unit cannot be negative"]
  },

  sellingPrice: { 
    type: Number,
    min: [0, "Selling price cannot be negative"]
  },


}, { timestamps: true });

// Auto-generate productCode like PRO-0001
productionSchema.pre("save", async function (next) {
  if (!this.productCode) {
    const lastProd = await mongoose.model("Production").findOne().sort({ createdAt: -1 });
    let nextCode = 1;
    if (lastProd && lastProd.productCode) {
      const lastNumber = parseInt(lastProd.productCode.split("-")[1]);
      nextCode = lastNumber + 1;
    }
    this.productCode = `PRO-${String(nextCode).padStart(4, "0")}`;
  }
  next();
});

const productionModel = mongoose.model("Production", productionSchema);
export default productionModel;
