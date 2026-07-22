const express = require('express');
const router  = express.Router();
const {
  signup,
  login,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup',   signup);
router.post('/login',    login);
router.post('/logout',   logout);
router.get('/me',        protect, getCurrentUser);
router.put('/profile',   protect, updateProfile);
router.post('/avatar',   protect, uploadAvatar);   // multipart/form-data

module.exports = router;
