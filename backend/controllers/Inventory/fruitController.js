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
    const { name,quantity,unit,reorderLevel } = req.body;
    const newFruit = new Fruit({ name, unit,quantity,reorderLevel });
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
