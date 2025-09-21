// Correct model path relative to this controllers folder
const Address = require("../../Model/Model-nadula/AddressModel");

exports.createAddress = async (req, res) => {
  try {
    const address = await Address.create(req.body);
    res.status(201).json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAddresses = async (_req, res) => {
  try {
    const addresses = await Address.find().sort({ createdAt: -1 });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ address });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



