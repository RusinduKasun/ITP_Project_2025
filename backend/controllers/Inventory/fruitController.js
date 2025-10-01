import Fruit from "../../models/Inventory/fruitModel.js";

// Get all fruits
export const getAllFruits = async (req, res) => {
  try {
    const fruits = await Fruit.find();
    res.status(200).json(fruits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fruits" });
  }
};

// Get a single fruit by ID
export const getFruitById = async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);
    if (!fruit) return res.status(404).json({ error: "Fruit not found" });
    res.status(200).json(fruit);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fruit" });
  }
};

// Add a new fruit
export const addFruit = async (req, res) => {
  try {
    const { name, quantity, unit, reorderLevel } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Fruit name is required" });
    }

    // Check if fruit already exists
    const existingFruit = await Fruit.findOne({ name: name.trim() });
    if (existingFruit) {
      // If fruit exists, update its quantity instead
      const updatedQuantity = existingFruit.quantity + Number(quantity);
      const updatedFruit = await Fruit.findByIdAndUpdate(
        existingFruit._id,
        { 
          quantity: updatedQuantity,
          unit,
          reorderLevel: Number(reorderLevel)
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Fruit quantity updated successfully",
        fruit: updatedFruit
      });
    }

    // Continue with validation for new fruit
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }

    if (!unit || !["kg", "pcs", "box"].includes(unit)) {
      return res.status(400).json({ error: "Valid unit is required (kg, pcs, or box)" });
    }

    if (reorderLevel === undefined || reorderLevel < 0) {
      return res.status(400).json({ error: "Valid reorder level is required" });
    }

    const allowedFruits = ["Wood Apple", "Jackfruit", "Banana", "Durian"];
    if (!allowedFruits.includes(name)) {
      return res.status(400).json({ error: "Invalid fruit type" });
    }

    // Create new fruit if it doesn't exist
    const newFruit = new Fruit({
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      reorderLevel: Number(reorderLevel)
    });
    await newFruit.save();
    res.status(201).json(newFruit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a fruit
export const updateFruit = async (req, res) => {
  try {
    const { name, unit,quantity,reorderLevel } = req.body;
    const updatedFruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      { name, unit,quantity,reorderLevel },
      { new: true, runValidators: true }
    );
    if (!updatedFruit) return res.status(404).json({ error: "Fruit not found" });
    res.status(200).json(updatedFruit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a fruit
export const deleteFruit = async (req, res) => {
  try {
    const deletedFruit = await Fruit.findByIdAndDelete(req.params.id);
    if (!deletedFruit) return res.status(404).json({ error: "Fruit not found" });
    res.status(200).json({ message: "Fruit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete fruit" });
  }
};
