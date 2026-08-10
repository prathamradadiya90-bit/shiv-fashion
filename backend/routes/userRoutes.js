const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, superAdmin, getUsers);
router.route('/:id/status').put(protect, superAdmin, toggleUserStatus);
router.route('/:id').delete(protect, superAdmin, deleteUser);

module.exports = router;
