const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const path = require('path');
const fs   = require('fs');
const multer = require('multer');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_placeholder', {
    expiresIn: '30d'
  });
};

// ─── Multer config for avatar uploads ─────────────────────────
const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
// Create folder if it doesn't exist
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  }
});

const avatarFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only image files (.jpg, .jpeg, .png, .webp) are allowed.'), false);
};

const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: avatarFilter
}).single('avatar');

// ─── Helpers ───────────────────────────────────────────────────
const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatar: user.avatar || null,
  createdAt: user.createdAt,
});

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ fullName, email, password });

    if (user) {
      res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server Error during signup', error: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error('Get Current User Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update profile (name and/or password)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update name if provided
    if (fullName && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    // Update password if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters.' });
      }
      user.password = newPassword; // pre-save hook will hash it
    }

    await user.save();
    res.status(200).json({ ...safeUser(user), message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error during profile update', error: error.message });
  }
};

// @desc    Upload / update avatar
// @route   POST /api/auth/avatar
// @access  Private
const uploadAvatar = (req, res) => {
  uploadAvatarMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum avatar size is 2 MB.' });
      }
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Delete old avatar file if it exists
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (_) {}
        }
      }

      // Store the relative path
      user.avatar = '/uploads/avatars/' + req.file.filename;
      await user.save();

      res.status(200).json({
        ...safeUser(user),
        message: 'Avatar uploaded successfully.',
        avatarUrl: `http://localhost:${process.env.PORT || 5000}${user.avatar}`
      });
    } catch (error) {
      console.error('Avatar Upload Error:', error);
      res.status(500).json({ message: 'Failed to save avatar', error: error.message });
    }
  });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (_req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  logout
};

