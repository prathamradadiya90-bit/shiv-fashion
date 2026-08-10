const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon } = require('../controllers/couponController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, superAdmin, getCoupons)
  .post(protect, superAdmin, createCoupon);

router.post('/apply', protect, applyCoupon);

router.route('/:id')
  .put(protect, superAdmin, updateCoupon)
  .delete(protect, superAdmin, deleteCoupon);

module.exports = router;
