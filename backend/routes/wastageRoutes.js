import express from 'express';
import {
  getWastageRecords,
  getWastageById,
  createWastage,
  deleteWastage,
  getWastageStats
} from '../controllers/wastageController.js';

const router = express.Router();

// Debug log middleware
router.use((req, res, next) => {
  console.log(`[Wastage Route] ${req.method} ${req.path}`);
  next();
});

// Base routes with error handling
router.get('/', async (req, res) => {
  try {
    await getWastageRecords(req, res);
  } catch (error) {
    console.error('Error in GET /api/wastage:', error);
    res.status(500).json({ message: 'Internal server error in wastage route' });
  }
});

router.post('/', async (req, res) => {
  try {
    await createWastage(req, res);
  } catch (error) {
    console.error('Error in POST /api/wastage:', error);
    res.status(500).json({ message: 'Internal server error in wastage route' });
  }
});

// Statistics route
router.get('/stats', getWastageStats);

// Individual record routes
router.route('/:id')
  .get(getWastageById)
  .delete(deleteWastage);

export default router;