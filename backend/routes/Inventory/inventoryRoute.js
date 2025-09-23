import express from 'express';
import { body } from 'express-validator';

import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory
} from '../../controllers/Inventory/inventoryController.js';

const router = express.Router();

// Validation rules
const inventoryValidation = [
  body('itemName')
    .notEmpty()
    .withMessage('Item name is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be non-negative'),
  body('supplierName')
    .notEmpty()
    .withMessage('Supplier name is required'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

// Routes
router.route('/')
  .get(getAllInventory)
  .post(inventoryValidation, createInventory);

router.route('/:id')
  .get(getInventoryById)
  .put(inventoryValidation, updateInventory)
  .delete(deleteInventory);

export default router;
