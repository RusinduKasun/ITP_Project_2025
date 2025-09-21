const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../Model/User');
const AdminOrder = require('../Model/adminOrder');

exports.generateUsersPDF = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const fileName = `Users_Report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.fontSize(20).text('Users Report', { align: 'center' });
    doc.moveDown();

    users.forEach((user, index) => {
      doc.fontSize(12)
        .text(`${index + 1}. Name: ${user.firstName} ${user.lastName}`)
        .text(`   Username: ${user.username}`)
        .text(`   Email: ${user.email}`)
        .text(`   Role: ${user.role}`)
        .text(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`)
        .text(`   Joined: ${new Date(user.createdAt).toLocaleDateString()}`)
        .moveDown();
    });

    doc.end();
    doc.pipe(res);

  } catch (error) {
    console.error('Error generating users PDF:', error);
    res.status(500).json({ message: 'Failed to generate users PDF', error: error.message });
  }
};

exports.generateSalesPDF = async (req, res) => {
  try {
  const orders = await AdminOrder.find().lean();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const fileName = `Sales_Report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.fontSize(20).text('Sales Report', { align: 'center' });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(12)
        .text(`${index + 1}. Order ID: ${order._id}`)
        .text(`   Total Amount: $${order.totalAmount}`)
        .text(`   Created At: ${new Date(order.createdAt).toLocaleDateString()}`)
        .text('   Products:');

      order.products.forEach((p) => {
        doc.text(`     - ${p.productId}: Quantity ${p.quantity}, Price $${p.price}`);
      });

      doc.moveDown();
    });

    doc.end();
    doc.pipe(res);

  } catch (error) {
    console.error('Error generating sales PDF:', error);
    res.status(500).json({ message: 'Failed to generate sales PDF', error: error.message });
  }
};

