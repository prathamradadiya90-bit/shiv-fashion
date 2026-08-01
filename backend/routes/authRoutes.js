const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, logoutAllDevices, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/logout-all', protect, logoutAllDevices);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
