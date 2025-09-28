import express from 'express';
import { body } from 'express-validator';
import {
  getAllFruits,
  getFruitById,
  addFruit,
  updateFruit,
  deleteFruit
} from '../../controllers/Inventory/fruitController.js';

const router = express.Router();

// Validation rules
const fruitValidation = [
  body('name')
    .notEmpty()
    .withMessage('Fruit name is required')
    .isIn(['Wood Apple', 'Jackfruit', 'Banana', 'Durian'])
    .withMessage('Invalid fruit type'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('unit')
    .isIn(['kg', 'pcs', 'box'])
    .withMessage('Invalid unit type'),
  body('reorderLevel')
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer')
];

// Routes
router.route('/')
  .get(getAllFruits)
  .post(fruitValidation, addFruit);

router.route('/:id')
  .get(getFruitById)
  .put(fruitValidation, updateFruit)
  .delete(deleteFruit);

export default router;
