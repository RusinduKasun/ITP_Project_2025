const express = require('express');
const {
  createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier
} = require('../Controllers/supplierController');

const router = express.Router();

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.get('/:id', getSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
