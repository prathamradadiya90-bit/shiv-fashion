const prisma = require('../config/db');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/SuperAdmin
const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/SuperAdmin
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, value, minOrderValue, expiryDate, isActive } = req.body;
    
    const couponExists = await prisma.coupon.findUnique({ where: { code } });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/SuperAdmin
const deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Apply a coupon
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive || new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    if (Number(orderValue) < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value of ₹${coupon.minOrderValue} required` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  deleteCoupon,
  applyCoupon
};
