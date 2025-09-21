// controllers/orderController.js
const Order = require('../Model/Order');
const Supplier = require('../Model/Supplier');
const Sequence = require('../Model/Sequence');

const createOrder = async (req, res) => {
  try {
    const { fruit, quantity, supplier: supplierId, deliveryDate } = req.body;

    // Validate required fields
    if (!fruit || !quantity || !supplierId || !deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields: fruit, quantity, supplier, or deliveryDate' });
    }

    // Validate supplier
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    // Validate fruit in supplier's priceList
    const priceEntry = supplier.priceList.find(p => p.fruit === fruit);
    if (!priceEntry) return res.status(400).json({ message: `Supplier does not provide ${fruit}` });

    // Calculate total price
    const totalPrice = priceEntry.pricePerUnit * quantity;

    // Generate unique orderId
    const sequence = await Sequence.findOneAndUpdate(
      { name: 'orderId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const orderId = `ORD-${String(sequence.value).padStart(4, '0')}`;

    // Create order
    const order = new Order({
      orderId,
      fruit,
      quantity,
      supplier: supplierId,
      deliveryDate,
      totalPrice,
      status: 'pending',
      trackingStatus: 'Order Placed',
    });
    await order.save();

    // Log notification
    console.log(
      `Notification sent to supplier ${supplier.name}: New order ${orderId} for ${quantity} of ${fruit} on ${deliveryDate}. ` +
      `Please visit http://localhost:5173/supplier-response to confirm or deny.`
    );

    // Return populated order
    const populatedOrder = await Order.findById(order._id).populate('supplier', 'name');
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(400).json({ message: err.message });
  }
};

const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.query.supplier) {
      query.supplier = req.query.supplier;
    }
    const orders = await Order.find(query).populate('supplier', 'name');
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { fruit, quantity, supplier: supplierId, deliveryDate, status, trackingStatus } = req.body;

    const updateData = {};
    if (fruit) updateData.fruit = fruit;
    if (quantity) updateData.quantity = quantity;
    if (supplierId) updateData.supplier = supplierId;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;
    if (status && ['pending', 'approved', 'denied'].includes(status)) {
      updateData.status = status;
    } else if (fruit || quantity || supplierId || deliveryDate) {
      updateData.status = 'pending'; // Reset to pending for order detail updates
    }
    if (trackingStatus && ['Order Placed', 'Approved', 'In Transit', 'Out for Delivery', 'Delivered'].includes(trackingStatus)) {
      updateData.trackingStatus = trackingStatus;
    }

    // Recalculate totalPrice if necessary
    if (fruit && quantity && supplierId) {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      const priceEntry = supplier.priceList.find(p => p.fruit === fruit);
      if (!priceEntry) return res.status(400).json({ message: `Supplier does not provide ${fruit}` });
      updateData.totalPrice = priceEntry.pricePerUnit * quantity;
    }

    // Update order
    const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('supplier', 'name');
    if (!updated) return res.status(404).json({ message: 'Order not found' });

    // Log notification for updates
    if (Object.keys(updateData).length > 0) {
      console.log(
        `Notification sent to supplier ${updated.supplier.name}: Updated order ${updated.orderId} for ${updated.quantity} of ${updated.fruit} on ${updated.deliveryDate}. ` +
        `Please visit http://localhost:5173/supplier-response to confirm or deny.`
      );
    }

    console.log(`Order ${updated.orderId} updated`);
    res.json(updated);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(400).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    console.log(`Deleted order ${order.orderId}`);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
};