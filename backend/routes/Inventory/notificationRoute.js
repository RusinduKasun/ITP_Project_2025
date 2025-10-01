import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  deleteNotification 
} from '../../controllers/Inventory/notificationController.js';

const router = express.Router();

// Get all notifications
router.get('/', getNotifications);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;