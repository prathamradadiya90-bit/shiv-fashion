const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/SuperAdmin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany();
  res.json(coupons);
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/SuperAdmin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, value, minOrderValue, expiryDate, isActive } = req.body;
  
  if (!code || !discountType || value == null || !expiryDate) {
    res.status(400);
    throw new Error('code, discountType, value, and expiryDate are required');
  }
  if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
    res.status(400);
    throw new Error('discountType must be PERCENTAGE or FIXED');
  }
  if (isNaN(Number(value)) || Number(value) <= 0) {
    res.status(400);
    throw new Error('value must be a positive number');
  }
  if (isNaN(new Date(expiryDate).getTime())) {
    res.status(400);
    throw new Error('expiryDate is not a valid date');
  }

  const couponExists = await prisma.coupon.findUnique({ where: { code } });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountType,
      value: Number(value),
      minOrderValue: Number(minOrderValue),
      expiryDate: new Date(expiryDate),
      isActive
    }
  });

  res.status(201).json(coupon);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/SuperAdmin
const deleteCoupon = asyncHandler(async (req, res) => {
  await prisma.coupon.delete({
    where: { id: req.params.id }
  });
  res.json({ message: 'Coupon removed' });
});

// @desc    Apply a coupon
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;
  
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  
  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive || new Date() > new Date(coupon.expiryDate)) {
    res.status(400);
    throw new Error('Coupon is expired or inactive');
  }

  if (Number(orderValue) < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required`);
  }

  res.json(coupon);
});

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
  applyCoupon
};
