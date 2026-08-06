const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  retryPayment,
  razorpayWebhook,
  trackOrder,
  paymentCallback,
} = require('../controllers/orderController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, superAdmin, getOrders);

router.route('/webhook').post(razorpayWebhook);
router.route('/payment-callback').post(paymentCallback);
const rateLimit = require('express-rate-limit');
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many tracking requests from this IP, please try again after 15 minutes' }
});

router.route('/track').post(trackLimiter, trackOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').post(protect, verifyPayment);
router.route('/:id/retry-pay').post(protect, retryPayment);
router.route('/:id/status').put(protect, superAdmin, updateOrderStatus);

module.exports = router;
