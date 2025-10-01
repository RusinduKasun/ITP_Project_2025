import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    updateUserRole,
    toggleUserStatus,
    deleteUser
} from '../../controllers/Admin/adminController.js';
import { adminAuth } from '../../middleware/Auth.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);

export default router;
