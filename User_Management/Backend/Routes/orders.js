// routes/orders.js
const express = require('express');
const {
  createOrder, getOrders, updateOrder, deleteOrder
} = require('../Controllers/orderController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;