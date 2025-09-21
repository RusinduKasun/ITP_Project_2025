const Supplier = require('../Model/Supplier');
const Sequence = require('../Model/Sequence');

const createSupplier = async (req, res) => {
  try {
    const { status } = req.body;
    if (status && !['Active', 'Pending', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active, Pending, or Inactive.' });
    }
    // Generate supplierId
    const sequence = await Sequence.findOneAndUpdate(
      { name: 'supplierId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const supplierId = `SUP-${String(sequence.value).padStart(4, '0')}`;
    const supplier = new Supplier({ ...req.body, supplierId });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const { search, fruit } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    if (fruit) {
      query.fruits = fruit;
    }
    const suppliers = await Supplier.find(query);
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { status } = req.body;
    if (status && !['Active', 'Pending', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active, Pending, or Inactive.' });
    }
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};