const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
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
  refundOrder,
  cancelOrder,
  requestOrderReturn,
  getOrderInvoice,
} = require('../controllers/orderController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

// ── Rate limiters ─────────────────────────────────────────────────────────────

// FIX #009: rate-limit the public payment-callback endpoint to prevent DoS
// and brute-force probing of razorpay_order_id values.
const callbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment callback requests from this IP, please try again later.' },
});

const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many tracking requests from this IP, please try again after 15 minutes' },
});

// ── Routes ────────────────────────────────────────────────────────────────────

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, superAdmin, getOrders);

router.route('/webhook').post(razorpayWebhook);
router.route('/payment-callback').post(callbackLimiter, paymentCallback);
router.route('/track').post(trackLimiter, trackOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/invoice').get(protect, getOrderInvoice);
router.route('/:id/pay').post(protect, verifyPayment);
router.route('/:id/retry-pay').post(protect, retryPayment);
router.route('/:id/refund').post(protect, superAdmin, refundOrder);
router.route('/:id/cancel').post(protect, cancelOrder);
router.route('/:id/return').post(protect, requestOrderReturn);
router.route('/:id/status').put(protect, superAdmin, updateOrderStatus);

module.exports = router;
