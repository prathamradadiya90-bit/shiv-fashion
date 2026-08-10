const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints that are brute-force targets
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts from this IP. Please try again after 15 minutes.' },
});

// Looser limiter for password-reset to avoid locking out legitimate users
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again after 1 hour.' },
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/logout-all', protect, logoutAllDevices);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
