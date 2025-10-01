import mongoose from "mongoose";

const fruitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, default: 0 }, // total stock across suppliers
  unit: { type: String, enum: ["kg", "pcs", "box"], default: "kg" },
  
  reorderLevel: { 
    type: Number, 
    default: 10,
    min: [0, 'Reorder level cannot be negative']
  },
}, { timestamps: true });

const Fruit = mongoose.model("Fruit", fruitSchema);
export default Fruit;
