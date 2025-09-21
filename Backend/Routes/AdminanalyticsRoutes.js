const express = require("express");
const router = express.Router();
const adminAnalyticsController = require("f:/User_Management/Backend/Controllers/adminanalyticsController");
const { adminAuth } = require("../Middleware/auth");

// Sales chart data
router.get("/sales", adminAuth, adminAnalyticsController.getSalesData);

// Top-selling products
router.get("/top-products", adminAuth, adminAnalyticsController.getTopProducts);

module.exports = router;
