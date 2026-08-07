const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/SuperAdmin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(coupons);
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/SuperAdmin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, value, minOrderValue, expiryDate, isActive } = req.body;

  // ── Required field validation ─────────────────────────────────────────────
  if (!code || typeof code !== 'string' || code.trim() === '') {
    res.status(400);
    throw new Error('Coupon code is required');
  }
  if (!discountType) {
    res.status(400);
    throw new Error('discountType is required');
  }
  if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
    res.status(400);
    throw new Error('discountType must be PERCENTAGE or FIXED');
  }
  if (value == null || isNaN(Number(value)) || Number(value) <= 0) {
    res.status(400);
    throw new Error('value must be a positive number');
  }
  if (discountType === 'PERCENTAGE' && Number(value) > 100) {
    res.status(400);
    throw new Error('Percentage discount cannot exceed 100');
  }
  if (!expiryDate) {
    res.status(400);
    throw new Error('expiryDate is required');
  }
  const parsedExpiry = new Date(expiryDate);
  if (isNaN(parsedExpiry.getTime())) {
    res.status(400);
    throw new Error('expiryDate is not a valid date');
  }
  if (parsedExpiry <= new Date()) {
    res.status(400);
    throw new Error('expiryDate must be in the future');
  }

  const normalizedCode = code.trim().toUpperCase();
  const couponExists = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: normalizedCode,
      discountType,
      value: Number(value),
      minOrderValue: minOrderValue != null ? Number(minOrderValue) : 0,
      expiryDate: parsedExpiry,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    },
  });

  res.status(201).json(coupon);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/SuperAdmin
const deleteCoupon = asyncHandler(async (req, res) => {
  const existing = await prisma.coupon.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ message: 'Coupon removed' });
});

// @desc    Apply a coupon (validates and returns discount details)
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400);
    throw new Error('Coupon code is required');
  }
  if (orderValue == null || isNaN(Number(orderValue))) {
    res.status(400);
    throw new Error('orderValue is required and must be a number');
  }

  const normalizedCode = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }
  if (!coupon.isActive) {
    res.status(400);
    throw new Error('Coupon is inactive');
  }
  // Use Date objects for comparison — never string comparison
  if (new Date() > new Date(coupon.expiryDate)) {
    res.status(400);
    throw new Error('Coupon has expired');
  }
  if (Number(orderValue) < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  res.json(coupon);
});

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
  applyCoupon,
};
