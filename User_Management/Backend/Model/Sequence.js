const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

module.exports = mongoose.models.Sequence || mongoose.model('Sequence', SequenceSchema);