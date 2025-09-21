const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { auth, adminAuth } = require('../Middleware/auth');

// Public routes for password reset
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes - require authentication for everything below
router.use(auth);

// User profile routes
// Return the current authenticated user's profile
router.get('/profile', (req, res) => {
  // user was loaded in auth middleware
  return res.json({ user: req.user });
});
router.put('/profile', userController.updateProfile);
router.put('/profile/picture', userController.updateProfilePicture);
router.put('/profile/password', userController.changePassword);

// Admin routes
router.get('/all', adminAuth, userController.getAllUsers);
router.delete('/:id', adminAuth, userController.deleteUser);
router.put('/:id/deactivate', adminAuth, userController.deactivateUser);

// Get user by ID (for viewing other profiles)
router.get('/:id', userController.getUserById);



module.exports = router;
