const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, superAdmin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').post(protect, verifyPayment);
router.route('/:id/status').put(protect, superAdmin, updateOrderStatus);

module.exports = router;
