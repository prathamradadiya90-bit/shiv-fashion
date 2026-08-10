const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidUUID } = require('../utils/validateUUID');

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

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/SuperAdmin
const updateCoupon = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid coupon ID format');
  }

  const { code, discountType, value, minOrderValue, expiryDate, isActive } = req.body;
  const existing = await prisma.coupon.findUnique({ where: { id: req.params.id } });
  
  if (!existing) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const updateData = {};

  if (code) {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
      if (codeExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
      }
      updateData.code = normalizedCode;
    }
  }

  if (discountType) {
    if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
      res.status(400);
      throw new Error('discountType must be PERCENTAGE or FIXED');
    }
    updateData.discountType = discountType;
  }

  if (value !== undefined) {
    if (isNaN(Number(value)) || Number(value) <= 0) {
      res.status(400);
      throw new Error('value must be a positive number');
    }
    updateData.value = Number(value);
  }

  const newType = updateData.discountType || existing.discountType;
  const newValue = updateData.value !== undefined ? updateData.value : existing.value;
  if (newType === 'PERCENTAGE' && newValue > 100) {
    res.status(400);
    throw new Error('Percentage discount cannot exceed 100');
  }

  if (minOrderValue !== undefined) {
    updateData.minOrderValue = Number(minOrderValue);
  }

  if (expiryDate) {
    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      res.status(400);
      throw new Error('expiryDate is not a valid date');
    }
    updateData.expiryDate = parsedExpiry;
  }

  if (isActive !== undefined) {
    updateData.isActive = Boolean(isActive);
  }

  const updatedCoupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: updateData,
  });

  res.json(updatedCoupon);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/SuperAdmin
const deleteCoupon = asyncHandler(async (req, res) => {
  // FIX #011: validate UUID before querying DB
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid coupon ID format');
  }

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
// FIX #010: return only the fields the frontend needs — internal metadata (id,
//           createdAt, isActive, etc.) is excluded. This also prevents leaking the
//           full coupon row to any authenticated user.
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
  if (new Date() > new Date(coupon.expiryDate)) {
    res.status(400);
    throw new Error('Coupon has expired');
  }
  if (Number(orderValue) < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
  }

  // Return only what the frontend needs to display the discount preview
  res.json({
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value,
    minOrderValue: coupon.minOrderValue,
  });
});

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
};
