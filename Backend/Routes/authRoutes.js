const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { auth } = require('../Middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-2fa', authController.verifyTwoFactor);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/enable-2fa', auth, authController.enableTwoFactor);
router.post('/disable-2fa', auth, authController.disableTwoFactor);

module.exports = router;
