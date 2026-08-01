const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/').get(protect, superAdmin, getStats);

module.exports = router;
