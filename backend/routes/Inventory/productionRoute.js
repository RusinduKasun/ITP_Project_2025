import express from 'express';
import { body } from 'express-validator';

import {
  createProduction,
  getAllProductions,
  getProductionById,
  updateProduction,
  deleteProduction
} from '../../controllers/Inventory/productionController.js';

const router = express.Router();

// Validation middleware
const productionValidation = [
  body('productName')
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .isIn(['chips', 'noodles', 'cordial', 'rawfruit', 'jam', 'juice', 'syrup'])
    .withMessage('Invalid category'),
  body('ingredients.*.item')
    .isMongoId()
    .withMessage('Ingredient item must be a valid Mongo ID'),
  body('ingredients.*.quantityUsed')
    .isFloat({ min: 0 })
    .withMessage('Quantity used must be >= 0'),
  body('quantityProduced')
    .isInt({ min: 0 })
    .withMessage('Quantity produced must be >= 0'),
  body('batchNumber')
    .notEmpty()
    .withMessage('Batch number is required'),
  body('costPerUnit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost per unit must be >= 0'),
  body('sellingPrice')
    .optional().isFloat({ min: 0 })
    .withMessage('Selling price must be >= 0'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

router.route('/')
  .get(getAllProductions)
  .post(productionValidation, createProduction);

router.route('/:id')
  .get(getProductionById)
  .put(productionValidation, updateProduction)
  .delete(deleteProduction);

export default router;
