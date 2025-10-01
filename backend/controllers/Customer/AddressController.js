import Address from '../../models/Customer/Address.js';

export const createAddress = async (req, res) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAddresses = async (_req, res) => {
  try {
    const addresses = await Address.find().sort({ createdAt: -1 });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



