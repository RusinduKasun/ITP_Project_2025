const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { adminAuth } = require('../Middleware/auth');

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
