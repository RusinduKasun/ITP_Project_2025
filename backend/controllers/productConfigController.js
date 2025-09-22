import ProductConfig from "../models/ProductConfig.js";

// Get all product configurations
export const getProductConfigs = async (req, res) => {
  try {
    const configs = await ProductConfig.find({ isActive: true });
    res.json(configs);
  } catch (err) {
    console.error("Error in getProductConfigs:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get product configuration by type
export const getProductConfigByType = async (req, res) => {
  try {
    const config = await ProductConfig.findOne({ 
      productType: req.params.productType,
      isActive: true 
    });
    if (!config) {
      return res.status(404).json({ message: "Product configuration not found" });
    }
    res.json(config);
  } catch (err) {
    console.error("Error in getProductConfigByType:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new product configuration
export const createProductConfig = async (req, res) => {
  try {
    const newConfig = new ProductConfig(req.body);
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (err) {
    console.error("Error in createProductConfig:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update product configuration
export const updateProductConfig = async (req, res) => {
  try {
    const updatedConfig = await ProductConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedConfig) {
      return res.status(404).json({ message: "Product configuration not found" });
    }
    res.json(updatedConfig);
  } catch (err) {
    console.error("Error in updateProductConfig:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get product price by type and variant
export const getProductPrice = async (req, res) => {
  try {
    const { productType, variantName } = req.query;
    const config = await ProductConfig.findOne({ 
      productType,
      isActive: true
    });
    
    if (!config) {
      return res.status(404).json({ message: "Product configuration not found" });
    }

    const variant = config.variants.find(v => v.name === variantName);
    if (!variant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    res.json({
      productType,
      variantName,
      unitPrice: variant.unitPrice,
      unit: variant.unit
    });
  } catch (err) {
    console.error("Error in getProductPrice:", err);
    res.status(500).json({ error: err.message });
  }
};