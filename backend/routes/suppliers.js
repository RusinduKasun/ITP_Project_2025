import express from 'express';
import {
  createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier
} from '../controllers/supplierController.js';

const router = express.Router();

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.get('/:id', getSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
