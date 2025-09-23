import mongoose from "mongoose";

const productConfigSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      required: true,
      enum: ["woodapple", "jackfruit", "durian", "banana", "other"],
    },
    variants: [{
      name: {
        type: String,
        required: true,
        enum: ["raw", "chips", "cordial", "dried", "jam", "paste"]
      },
      unitPrice: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true,
        enum: ["kg", "piece", "bottle", "packet"]
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Add index for quick lookups
productConfigSchema.index({ productType: 1 });

const ProductConfig = mongoose.model("ProductConfig", productConfigSchema);

export default ProductConfig;