const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, superAdmin, getUsers);
router.route('/:id/status').put(protect, superAdmin, toggleUserStatus);

module.exports = router;
