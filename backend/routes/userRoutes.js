const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, superAdmin, getUsers);

module.exports = router;
