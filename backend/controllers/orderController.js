const prisma = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');
const {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_CHARGE,
  COD_ADVANCE,
  GST_RATE,
  MAX_ITEM_QUANTITY,
} = require('../utils/constants');
const { isValidUUID } = require('../utils/validateUUID');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Valid order status transitions — prevents illogical state changes
const VALID_TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// @desc    Create new order & razorpay order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('orderItems must be a non-empty array');
  }

  if (
    !shippingAddress ||
    typeof shippingAddress !== 'object' ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.zipCode
  ) {
    res.status(400);
    throw new Error('shippingAddress with street, city, state, and zipCode is required');
  }

  for (const item of orderItems) {
    if (!item.productId || typeof item.productId !== 'string') {
      res.status(400);
      throw new Error('Each order item must have a valid productId');
    }
    if (!isValidUUID(item.productId)) {
      res.status(400);
      throw new Error(`Invalid productId format: ${item.productId}`);
    }
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > MAX_ITEM_QUANTITY) {
      res.status(400);
      throw new Error(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
    }
  }

  // ── Calculate total from DB (prevents client-side price tampering) ─────────
  // Batch-fetch all products in one query instead of per-item (no N+1)
  const productIds = [...new Set(orderItems.map(i => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true, discount: true, stock: true },
  });
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  // Pre-validate stock before entering transaction (fast-fail for user feedback)
  for (const item of orderItems) {
    const product = productMap[item.productId];
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.productId} not found or is no longer available`);
    }
    if (product.stock < parseInt(item.quantity, 10)) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }
  }

  // ── Compute totals in integer paise ───────────────────────────────────────
  let totalAmountPaise = 0;
  const itemsForDb = [];

  for (const item of orderItems) {
    const product = productMap[item.productId];
    let finalPricePaise = Math.round(product.price * 100);
    if (product.discount > 0) {
      finalPricePaise -= Math.round(finalPricePaise * (product.discount / 100));
    }
    totalAmountPaise += finalPricePaise * parseInt(item.quantity, 10);
    itemsForDb.push({
      productId: product.id,
      size: item.size || 'Free size',
      color: item.color || '',
      quantity: parseInt(item.quantity, 10),
      price: finalPricePaise / 100,
    });
  }

  // ── Shipping and Tax ───────────────────────────────────────────────────────
  const shippingPricePaise = totalAmountPaise > FREE_SHIPPING_THRESHOLD * 100
    ? 0
    : Math.round(SHIPPING_CHARGE * 100);
  const taxPricePaise = Math.round(totalAmountPaise * GST_RATE);
  let finalTotalAmountPaise = totalAmountPaise + shippingPricePaise + taxPricePaise;

  // ── Server-side coupon validation ─────────────────────────────────────────
  const { couponCode, isCOD } = req.body;
  let calculatedDiscountPaise = 0;

  if (couponCode && typeof couponCode === 'string') {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });
    if (
      coupon &&
      coupon.isActive &&
      new Date() <= new Date(coupon.expiryDate) &&
      finalTotalAmountPaise / 100 >= coupon.minOrderValue
    ) {
      if (coupon.discountType === 'PERCENTAGE') {
        calculatedDiscountPaise = Math.round(finalTotalAmountPaise * (coupon.value / 100));
      } else {
        calculatedDiscountPaise = Math.round(coupon.value * 100);
      }
    }
  }

  finalTotalAmountPaise = Math.max(0, finalTotalAmountPaise - calculatedDiscountPaise);

  const finalTotalAmount = finalTotalAmountPaise / 100;
  const amountToCharge = isCOD ? COD_ADVANCE : finalTotalAmount;

  // ── Create Razorpay order ──────────────────────────────────────────────────
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amountToCharge * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Failed to create payment order. Check Razorpay keys.');
  }

  const enhancedShippingAddress = {
    ...shippingAddress,
    paymentMethod: isCOD ? 'COD' : 'PREPAID',
  };

  // ── DB transaction: create order + decrement stock atomically ─────────────
  // FIX #001 + #005: stock is decremented inside the same transaction that
  // creates the order, with a re-check (stock >= qty) to close the race window.
  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-check and decrement stock atomically for each item
      for (const item of itemsForDb) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // atomic guard against race condition
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          // Another concurrent request depleted stock between our pre-check and here
          throw new Error(`Product is now out of stock. Please update your cart.`);
        }
      }

      return await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: finalTotalAmount,
          status: 'PENDING',
          isCOD: Boolean(isCOD),
          shippingAddress: enhancedShippingAddress,
          razorpayOrderId: razorpayOrder.id,
          items: { create: itemsForDb },
        },
        include: { items: true },
      });
    });

    res.status(201).json({ order, razorpayOrder });
  } catch (dbError) {
    // FIX #008: attempt to cancel the orphaned Razorpay order so the customer
    // is not left with a dangling payment request.
    try {
      await razorpayInstance.orders.cancel(razorpayOrder.id);
      console.info(`[addOrderItems] Cancelled orphaned Razorpay order ${razorpayOrder.id}`);
    } catch (cancelErr) {
      // Log prominently for manual reconciliation — do NOT swallow silently
      console.error(
        `[addOrderItems] CRITICAL: DB write failed AND Razorpay order ${razorpayOrder.id} could not be cancelled. Manual reconciliation required.`,
        cancelErr.message
      );
    }

    const isStockError = dbError.message.includes('out of stock');
    res.status(isStockError ? 400 : 500);
    throw new Error(
      isStockError
        ? dbError.message
        : 'Failed to save order to database. If payment was deducted, please contact support.'
    );
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/pay
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    res.status(400);
    throw new Error('razorpayPaymentId, razorpayOrderId, and razorpaySignature are required');
  }

  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to verify this order');
  }

  if (order.paymentStatus === 'PAID') {
    return res.json({ message: 'Payment already verified' });
  }

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error('Invalid payment signature');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      razorpayPaymentId,
      razorpaySignature,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  sendEmail({
    email: updatedOrder.user.email,
    subject: `Shreeji Fashion - Order Confirmed (${updatedOrder.id})`,
    message: `Hello ${updatedOrder.user.name},\n\nThank you for shopping with Shreeji Fashion!\nYour order (${updatedOrder.id}) has been confirmed and payment is successful.\nTotal Amount: ₹${updatedOrder.totalAmount}\n\nWe will notify you once your order is shipped.\n\nRegards,\nShreeji Fashion Team`,
  }).catch(err => console.error('[verifyPayment] Email error:', err.message));

  res.json({ message: 'Payment verified successfully' });
});

// @desc    Handle Razorpay redirect callback from mobile payments
// @route   POST /api/orders/payment-callback
// @access  Public
// FIX #002: server-side payment fetch from Razorpay before marking order PAID.
const paymentCallback = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.redirect(`${frontendBase}/cart`);
  }

  const order = await prisma.order.findFirst({ where: { razorpayOrderId: razorpay_order_id } });
  if (!order) {
    return res.redirect(`${frontendBase}/cart`);
  }

  // Step 1: verify HMAC signature (client-side integrity check)
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    // Signature mismatch — do not update order; redirect without marking paid
    console.error(`[paymentCallback] Signature mismatch for order ${order.id}`);
    return res.redirect(`${frontendBase}/order/${order.id}`);
  }

  // Step 2: fetch payment from Razorpay server-side to confirm it was actually captured
  // This prevents a forged signature from marking an order as paid without real payment.
  if (order.paymentStatus !== 'PAID') {
    try {
      const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

      if (payment.status === 'captured' && payment.order_id === razorpay_order_id) {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
          include: { user: { select: { name: true, email: true } } },
        });

        sendEmail({
          email: updatedOrder.user.email,
          subject: `Shreeji Fashion - Order Confirmed (${updatedOrder.id})`,
          message: `Hello ${updatedOrder.user.name},\n\nThank you for shopping with Shreeji Fashion!\nYour order (${updatedOrder.id}) has been confirmed.\nTotal: ₹${updatedOrder.totalAmount}`,
        }).catch(err => console.error('[paymentCallback] Email error:', err.message));
      } else {
        console.error(
          `[paymentCallback] Payment ${razorpay_payment_id} status="${payment.status}" — not marking order PAID`
        );
      }
    } catch (fetchErr) {
      // If Razorpay fetch fails, do not mark paid — the webhook will handle it
      console.error('[paymentCallback] Razorpay payment fetch error:', fetchErr.message);
    }
  }

  res.redirect(`${frontendBase}/order/${order.id}`);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
// FIX #014: added pagination and replaced SELECT * on product with a field selection
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 10;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ orders, page, pages: Math.ceil(total / pageSize), total });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: { take: 1, select: { url: true } },
              category: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id && req.user.role !== 'SUPERADMIN') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/SuperAdmin
// FIX #015: added pagination — never load all orders into memory
const getOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 20;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count(),
  ]);

  res.json({ orders, page, pages: Math.ceil(total / pageSize), total });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/SuperAdmin
// FIX #007: state-machine transition guard prevents illogical status moves
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;

  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const VALID_STATUSES = Object.keys(VALID_TRANSITIONS);
  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const existingOrder = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existingOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Enforce valid state transitions
  if (status && !VALID_TRANSITIONS[existingOrder.status].includes(status)) {
    res.status(400);
    throw new Error(
      `Cannot transition order from "${existingOrder.status}" to "${status}". ` +
      `Allowed transitions: ${VALID_TRANSITIONS[existingOrder.status].join(', ') || 'none'}`
    );
  }

  // Build update payload — only include defined fields to avoid overwriting with undefined
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: updateData,
    include: { user: { select: { name: true, email: true } } },
  });

  if (status === 'SHIPPED') {
    sendEmail({
      email: order.user.email,
      subject: `Shreeji Fashion - Order Shipped (${order.id})`,
      message: `Hello ${order.user.name},\n\nYour order (${order.id}) has been shipped.\n${trackingNumber ? `Tracking Number: ${trackingNumber}` : 'Your package is on its way.'}\n\nRegards,\nShreeji Fashion Team`,
    }).catch(err => console.error('[updateOrderStatus] Email error:', err.message));
  }

  res.json(order);
});

// @desc    Retry payment for existing order
// @route   POST /api/orders/:id/retry-pay
// @access  Private
const retryPayment = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }

  if (order.paymentStatus === 'PAID' || order.status === 'CANCELLED') {
    res.status(400);
    throw new Error('Cannot retry payment for this order');
  }

  const amountToCharge = order.isCOD ? COD_ADVANCE : order.totalAmount;

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: Math.round(amountToCharge * 100),
    currency: 'INR',
    receipt: `rcpt_retry_${Date.now()}`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  res.json({ razorpayOrder, order });
});

// @desc    Razorpay Webhook handler
// @route   POST /api/orders/webhook
// @access  Public
const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(JSON.stringify(req.body));

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    res.status(400);
    throw new Error('Invalid webhook signature');
  }

  const payload = Buffer.isBuffer(req.body)
    ? JSON.parse(req.body.toString('utf8'))
    : req.body;
  const event = payload.event;

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity) {
      return res.status(200).json({ status: 'ok', note: 'No payment entity in payload' });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId,
        },
      });
      console.info(`[webhook] Order ${order.id} marked PAID via webhook`);
    }
  }

  res.status(200).json({ status: 'ok' });
});

// @desc    Track order (public, PII-masked)
// @route   POST /api/orders/track
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { type, value, email } = req.body;

  if (!type || !value || !email) {
    res.status(400);
    throw new Error('Please provide type, value, and email for tracking');
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(String(email).trim())) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  let orders = [];

  if (type === 'orderId') {
    const order = await prisma.order.findFirst({
      where: {
        id: String(value),
        user: { email: String(email).trim().toLowerCase() },
      },
      include: {
        items: {
          include: { product: { select: { name: true, images: { take: 1, select: { url: true } } } } },
        },
      },
    });
    if (order) orders = [order];
  } else if (type === 'mobile') {
    const cleanPhone = String(value).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      res.status(400);
      throw new Error('Invalid mobile number');
    }
    const searchPhone = cleanPhone.slice(-10);
    orders = await prisma.order.findMany({
      where: {
        user: {
          phone: { contains: searchPhone },
          email: String(email).trim().toLowerCase(),
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, images: { take: 1, select: { url: true } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } else {
    res.status(400);
    throw new Error('Invalid track type. Must be "orderId" or "mobile"');
  }

  if (orders.length === 0) {
    res.status(404);
    throw new Error('No orders found matching this detail');
  }

  const maskedOrders = orders.map(order => ({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    trackingNumber: order.trackingNumber,
    shippingAddress: order.shippingAddress
      ? {
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: '***', // Masked to prevent PII leak
        }
      : {},
    items: order.items.map(item => ({
      name: item.product?.name,
      image: item.product?.images?.[0]?.url,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
    })),
  }));

  res.json(maskedOrders);
});

module.exports = {
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
};
