import express from 'express';
import {
  forgotPassword,
  resetPassword,
  updateProfile,
  updateProfilePicture,
  changePassword,
  getAllUsers,
  deleteUser,
  deactivateUser,
  getUserById
} from '../../controllers/Admin/userController.js';
import { auth, adminAuth } from '../../middleware/Auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // limit 5MB

const router = express.Router();

// Public routes for password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes - require authentication for everything below
router.use(auth);

// User profile routes
router.get('/profile', (req, res) => {
  // user was loaded in auth middleware
  return res.json({ user: req.user });
});
router.put('/profile', updateProfile);
// Accept either JSON body { profilePicture: 'https://...' } or multipart/form-data with field 'profilePictureFile'
router.put('/profile/picture', upload.single('profilePictureFile'), updateProfilePicture);
router.put('/profile/password', changePassword);

// Admin routes
router.get('/all', adminAuth, getAllUsers);
router.delete('/:id', adminAuth, deleteUser);
router.put('/:id/deactivate', adminAuth, deactivateUser);

// Get user by ID (for viewing other profiles)
router.get('/:id', getUserById);

export default router;
