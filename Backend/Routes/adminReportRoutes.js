const express = require('express');
const router = express.Router();
const { adminAuth } = require('../Middleware/auth');
const reportController = require('../Controllers/adminReportController');

// Generate Users PDF report
router.get('/users', adminAuth, reportController.generateUsersPDF);

// Generate Sales PDF report
router.get('/sales', adminAuth, reportController.generateSalesPDF);

module.exports = router;
