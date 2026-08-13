const express = require('express');
const router = express.Router();
const {
  exportUsers,
  exportOrders,
} = require('../controllers/exportController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/users').get(protect, superAdmin, exportUsers);
router.route('/orders').get(protect, superAdmin, exportOrders);

module.exports = router;
