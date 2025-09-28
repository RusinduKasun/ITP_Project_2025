import NotificationModel from '../../models/Inventory/NotificationModel.js';
import FruitModel from '../../models/Inventory/fruitModel.js';

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    console.log('Checking for low stock items...');
    // First, check for low stock items
    const lowStockFruits = await FruitModel.find({
      $expr: {
        $lte: ["$quantity", "$reorderLevel"]
      }
    });

    console.log('Low stock fruits found:', lowStockFruits);

    // Create notifications for low stock items
    for (const fruit of lowStockFruits) {
      const existingNotification = await NotificationModel.findOne({
        type: 'LOW_STOCK',
        itemId: fruit._id,
        isRead: false
      });

      if (!existingNotification) {
        console.log('Creating new low stock notification for:', fruit.name);
        await NotificationModel.create({
          type: 'LOW_STOCK',
          message: `Low stock alert: ${fruit.name} (${fruit.quantity} ${fruit.unit} remaining)`,
          itemId: fruit._id,
          quantity: fruit.quantity
        });
      }
    }

    // Fetch all notifications after creating new ones
    const notifications = await NotificationModel.find()
      .populate({
        path: 'itemId',
        model: 'Fruit',
        select: 'name quantity unit'
      })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('Sending notifications:', notifications);
    res.json(notifications.filter(n => n.itemId != null));
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    await NotificationModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check and create notifications based on inventory status
export const checkAndCreateNotifications = async () => {
  try {
    const fruits = await FruitModel.find();
    
    for (const fruit of fruits) {
      // Check for low stock
      if (fruit.quantity <= fruit.reorderLevel) {
        const existingNotification = await NotificationModel.findOne({
          itemId: fruit._id,
          type: 'LOW_STOCK',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        if (!existingNotification) {
          await NotificationModel.create({
            type: 'LOW_STOCK',
            message: `Low stock alert: ${fruit.name} (${fruit.quantity} ${fruit.unit} remaining)`,
            itemId: fruit._id
          });
        }
      }
      
      // Check for near expiry (if expiry date exists)
      if (fruit.expiryDate) {
        const daysUntilExpiry = Math.ceil((new Date(fruit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 7) {
          const existingNotification = await NotificationModel.findOne({
            itemId: fruit._id,
            type: 'EXPIRED',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          });

          if (!existingNotification) {
            await NotificationModel.create({
              type: 'EXPIRED',
              message: `${fruit.name} will expire in ${daysUntilExpiry} days`,
              itemId: fruit._id
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

// Create production complete notification
export const createProductionNotification = async (productionData) => {
  try {
    await NotificationModel.create({
      type: 'PRODUCTION_COMPLETE',
      message: `Production completed: ${productionData.productName} (${productionData.quantityProduced} units)`,
      itemId: productionData.fruitId
    });
  } catch (error) {
    console.error('Error creating production notification:', error);
  }
};

// Create reorder notification
export const createReorderNotification = async (fruitId) => {
  try {
    const fruit = await FruitModel.findById(fruitId);
    if (fruit) {
      await NotificationModel.create({
        type: 'REORDER',
        message: `Time to reorder ${fruit.name}. Current stock: ${fruit.quantity} ${fruit.unit}`,
        itemId: fruit._id
      });
    }
  } catch (error) {
    console.error('Error creating reorder notification:', error);
  }
};