// routes/orders.js
import express from 'express';
import {
  createOrder, getOrders, updateOrder, deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;