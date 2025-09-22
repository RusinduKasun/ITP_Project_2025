import mongoose from 'mongoose';

const SequenceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});
// Add timestamps to track creation and updates
export default mongoose.model('Sequence', SequenceSchema);