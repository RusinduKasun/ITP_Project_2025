import express from 'express';
import {
    register,
    login,
    logout,
    socialLogin,
    verifyTwoFactor,
    getCurrentUser,
    enableTwoFactor,
    disableTwoFactor
} from '../../controllers/Admin/authController.js';
import { auth } from '../../middleware/Auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/social-login', socialLogin);
router.post('/verify-2fa', verifyTwoFactor);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/enable-2fa', auth, enableTwoFactor);
router.post('/disable-2fa', auth, disableTwoFactor);

export default router;
