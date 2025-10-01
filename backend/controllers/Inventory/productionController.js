import Production from '../../models/Inventory/productionModel.js'
import { validationResult } from 'express-validator';

// CREATE
export const createProduction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const production = new Production(req.body);
    await production.save();
    res.status(201).json(production);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
export const getAllProductions = async (req, res) => {
  try {
    const productions = await Production.find().populate('ingredients.item');
    res.json(productions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// READ ONE
export const getProductionById = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id).populate('ingredients.item');
    if (!production) return res.status(404).json({ message: 'Production not found' });
    res.json(production);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateProduction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const production = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('ingredients.item');;
    if (!production) return res.status(404).json({ message: 'Production not found' });
    res.json(production);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const deleteProduction = async (req, res) => {
  try {
    const production = await Production.findByIdAndDelete(req.params.id);
    if (!production) return res.status(404).json({ message: 'Production not found' });
    res.json({ message: 'Production deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
