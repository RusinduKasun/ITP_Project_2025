import Wastage from '../../models/Finance/Wastage.js';

// Get all wastage records
export const getWastageRecords = async (req, res) => {
  try {
    console.log('[Controller] Getting all wastage records');
    const wastageRecords = await Wastage.find().sort({ date: -1 });
    console.log(`[Controller] Found ${wastageRecords.length} records`);
    res.json(wastageRecords);
  } catch (err) {
    console.error('[Controller] Error getting wastage records:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get wastage record by ID
export const getWastageById = async (req, res) => {
  try {
    const wastage = await Wastage.findById(req.params.id);
    if (!wastage) {
      return res.status(404).json({ message: 'Wastage record not found' });
    }
    res.json(wastage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new wastage record
export const createWastage = async (req, res) => {
  try {
    const wastage = new Wastage(req.body);
    const newWastage = await wastage.save();
    res.status(201).json(newWastage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete wastage record
export const deleteWastage = async (req, res) => {
  try {
    const wastage = await Wastage.findById(req.params.id);
    if (!wastage) {
      return res.status(404).json({ message: 'Wastage record not found' });
    }

    await Wastage.deleteOne({ _id: req.params.id });
    res.json({ message: 'Wastage record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get wastage statistics
export const getWastageStats = async (req, res) => {
  try {
    // Total wastage statistics
    const totalStats = await Wastage.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$wastageCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Wastage by category
    const categoryStats = await Wastage.aggregate([
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$wastageCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Wastage by fruit type
    const fruitStats = await Wastage.aggregate([
      {
        $group: {
          _id: '$fruitType',
          totalCost: { $sum: '$wastageCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Most common reasons
    const commonReasons = await Wastage.aggregate([
      {
        $group: {
          _id: '$specificReason',
          count: { $sum: 1 },
          totalCost: { $sum: '$wastageCost' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overall: totalStats[0] || { totalCost: 0, totalQuantity: 0, count: 0 },
      byCategory: categoryStats,
      byFruit: fruitStats,
      commonReasons
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};