const prisma = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');
const {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_CHARGE,
  COD_ADVANCE,
  MAX_ITEM_QUANTITY,
} = require('../utils/constants');
const { isValidUUID } = require('../utils/validateUUID');
const { sendNotification, sendNotificationToAdmins } = require('../utils/socket');
const { generateInvoicePdf } = require('../utils/generateInvoicePdf');

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
  // product.price is stored in paise (Int) in the DB — do NOT multiply by 100 again.
  // discount is stored in basis points (Int): 10% = 1000 basis points.
  // OrderItem.price is stored in paise (Int).
  // Order.totalAmount is stored in paise (Int).
  let totalAmountPaise = 0;
  const itemsForDb = [];

  for (const item of orderItems) {
    const product = productMap[item.productId];
    // product.price is already in paise — no conversion needed
    let finalPricePaise = product.price;
    if (product.discount > 0) {
      // discount is in basis points (1000 = 10%) — divide by 10000 to get fraction
      finalPricePaise -= Math.round(finalPricePaise * (product.discount / 10000));
    }
    totalAmountPaise += finalPricePaise * parseInt(item.quantity, 10);
    itemsForDb.push({
      productId: product.id,
      size: item.size || 'Free size',
      color: item.color || '',
      quantity: parseInt(item.quantity, 10),
      price: finalPricePaise, // stored in paise (Int) as per schema
    });
  }

  // ── Shipping and Tax ───────────────────────────────────────────────────────
  // FREE_SHIPPING_THRESHOLD and SHIPPING_CHARGE are in rupees (from constants) — convert to paise
  const shippingPricePaise = totalAmountPaise > FREE_SHIPPING_THRESHOLD * 100
    ? 0
    : Math.round(SHIPPING_CHARGE * 100);
  let finalTotalAmountPaise = totalAmountPaise + shippingPricePaise;

  // ── Server-side coupon validation ─────────────────────────────────────────
  const { couponCode, isCOD } = req.body;
  let calculatedDiscountPaise = 0;
  let validatedCoupon = null;

  if (couponCode && typeof couponCode === 'string') {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });
    if (
      coupon &&
      coupon.isActive &&
      new Date() <= new Date(coupon.expiryDate) &&
      finalTotalAmountPaise >= coupon.minOrderValue  // both in paise
    ) {
      // FIX #005: check global usage limit (0 = unlimited)
      if (coupon.maxUsage > 0 && coupon.usageCount >= coupon.maxUsage) {
        res.status(400);
        throw new Error('This coupon has reached its maximum usage limit');
      }

      // FIX #005: check per-user usage limit (0 = unlimited)
      if (coupon.maxUsagePerUser > 0) {
        const userUsageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId: req.user.id },
        });
        if (userUsageCount >= coupon.maxUsagePerUser) {
          res.status(400);
          throw new Error('You have already used this coupon the maximum number of times');
        }
      }

      if (coupon.discountType === 'PERCENTAGE') {
        // coupon.value is in basis points (1000 = 10%) for PERCENTAGE type
        calculatedDiscountPaise = Math.round(finalTotalAmountPaise * (coupon.value / 10000));
      } else {
        // coupon.value for FIXED type is already in paise (e.g. ₹50 = 5000 paise)
        calculatedDiscountPaise = coupon.value;
      }
      validatedCoupon = coupon;
    }
  }

  finalTotalAmountPaise = Math.max(0, finalTotalAmountPaise - calculatedDiscountPaise);

  // FIX #006: totalAmount stored in DB as paise (Int) — do NOT divide by 100.
  // Razorpay also expects paise — pass directly.
  const amountToChargePaise = isCOD ? Math.round(COD_ADVANCE * 100) : finalTotalAmountPaise;

  // ── Create Razorpay order ──────────────────────────────────────────────────
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: amountToChargePaise,  // already in paise
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
          totalAmount: finalTotalAmountPaise, // FIX #006: store in paise (Int)
          status: 'PENDING',
          isCOD: Boolean(isCOD),
          shippingAddress: enhancedShippingAddress,
          razorpayOrderId: razorpayOrder.id,
          couponCode: validatedCoupon ? validatedCoupon.code : null,
          items: { create: itemsForDb },
        },
        include: { items: true },
      });
    });

    // FIX #005: record coupon usage and increment counter AFTER the order is committed
    // so a rollback never leaves a phantom usage record.
    if (validatedCoupon) {
      await prisma.$transaction([
        prisma.couponUsage.create({
          data: {
            couponId: validatedCoupon.id,
            userId: req.user.id,
            orderId: order.id,
          },
        }),
        prisma.coupon.update({
          where: { id: validatedCoupon.id },
          data: { usageCount: { increment: 1 } },
        }),
      ]);
    }

    // Automated Low-Stock Alert: notify admins if any ordered product has <= 3 units remaining
    try {
      const productIds = itemsForDb.map((i) => i.productId);
      const lowStockProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          stock: { lte: 3 },
        },
        select: { id: true, name: true, stock: true },
      });

      for (const prod of lowStockProducts) {
        sendNotificationToAdmins(
          'LOW_STOCK',
          'Low Stock Alert',
          `Product "${prod.name}" has ${prod.stock === 0 ? 'run OUT OF STOCK' : `only ${prod.stock} item(s) remaining`}.`,
          'Product'
        );
      }
    } catch (notifErr) {
      logger.error(`[addOrderItems] Low stock notification error: ${notifErr.message}`);
    }

    res.status(201).json({ order, razorpayOrder });
  } catch (dbError) {
    // Razorpay Node.js SDK does not expose an orders.cancel() method.
    // Log prominently for manual reconciliation if needed.
    logger.error(
      `[addOrderItems] CRITICAL: DB write failed. Orphaned Razorpay order ${razorpayOrder.id} was created. Manual reconciliation may be required. dbError=${dbError.message}`
    );

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
    // FIX #006: totalAmount is in paise — divide by 100 for display
    message: `Hello ${updatedOrder.user.name || 'Customer'},\n\nThank you for shopping with Shreeji Fashion!\nYour order (${updatedOrder.id}) has been confirmed and payment is successful.\nTotal Amount: ₹${(updatedOrder.totalAmount / 100).toFixed(2)}\n\nWe will notify you once your order is shipped.\n\nRegards,\nShreeji Fashion Team`,
  }).catch(err => logger.error(`[verifyPayment] Email error: ${err.message}`));

  await sendNotification(
    updatedOrder.userId,
    'Payment Successful',
    `Your payment for order ${updatedOrder.id} is confirmed.`,
    'PAYMENT_SUCCESS',
    updatedOrder.id,
    'Order'
  );

  await sendNotificationToAdmins(
    'New Order Received',
    `A new order (${updatedOrder.id}) has been placed by ${updatedOrder.user.name || 'Customer'}.`,
    'ORDER_PLACED',
    updatedOrder.id,
    'Order'
  );

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
    logger.error(`[paymentCallback] Signature mismatch for order ${order.id}`);
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
          // FIX #006 + #008: totalAmount is in paise — divide by 100; name fallback
          message: `Hello ${updatedOrder.user.name || 'Customer'},\n\nThank you for shopping with Shreeji Fashion!\nYour order (${updatedOrder.id}) has been confirmed.\nTotal: ₹${(updatedOrder.totalAmount / 100).toFixed(2)}`,
        }).catch(err => logger.error(`[paymentCallback] Email error: ${err.message}`));

        await sendNotification(
          updatedOrder.userId,
          'Payment Successful',
          `Your payment for order ${updatedOrder.id} is confirmed.`,
          'PAYMENT_SUCCESS',
          updatedOrder.id,
          'Order'
        );

        await sendNotificationToAdmins(
          'New Order Received',
          `A new order (${updatedOrder.id}) has been placed by ${updatedOrder.user.name || 'Customer'}.`,
          'ORDER_PLACED',
          updatedOrder.id,
          'Order'
        );
      } else {
        logger.error(
          `[paymentCallback] Payment ${razorpay_payment_id} status="${payment.status}" — not marking order PAID`
        );
      }
    } catch (fetchErr) {
      // If Razorpay fetch fails, do not mark paid — the webhook will handle it
      logger.error(`[paymentCallback] Razorpay payment fetch error: ${fetchErr.message}`);
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
const getOrders = asyncHandler(async (req, res) => {
  const { status, search, paymentStatus, pageSize: customPageSize, page: pageQuery } = req.query;

  const page = Math.max(1, parseInt(pageQuery, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(customPageSize, 10) || 20));

  const whereConditions = [];

  // Filter by status if provided and not 'ALL'
  if (status && status.toUpperCase() !== 'ALL') {
    const upperStatus = status.toUpperCase();
    const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (VALID_STATUSES.includes(upperStatus)) {
      whereConditions.push({ status: upperStatus });
    }
  }

  // Filter by paymentStatus if provided and not 'ALL'
  if (paymentStatus && paymentStatus.toUpperCase() !== 'ALL') {
    const upperPayment = paymentStatus.toUpperCase();
    const VALID_PAYMENTS = ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'];
    if (VALID_PAYMENTS.includes(upperPayment)) {
      whereConditions.push({ paymentStatus: upperPayment });
    }
  }

  // Search by order ID, customer name, email, or tracking number
  if (search && search.trim()) {
    const term = search.trim();
    whereConditions.push({
      OR: [
        { id: { contains: term, mode: 'insensitive' } },
        { trackingNumber: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
        { user: { phone: { contains: term, mode: 'insensitive' } } },
      ],
    });
  }

  const filter = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: filter,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
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
    prisma.order.count({ where: filter }),
  ]);

  res.json({
    orders,
    page,
    pages: Math.ceil(total / pageSize),
    total,
    pageSize,
  });
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

  const existingOrder = await prisma.order.findUnique({ 
    where: { id: req.params.id },
    include: { items: true }
  });
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

  let order;
  if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
    order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: req.params.id },
        data: updateData,
        include: { user: { select: { name: true, email: true } } },
      });
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return updated;
    });
  } else {
    order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  if (status === 'SHIPPED') {
    sendEmail({
      email: order.user.email,
      subject: `Shreeji Fashion - Order Shipped (${order.id})`,
      message: `Hello ${order.user.name || 'Customer'},\n\nYour order (${order.id}) has been shipped.\n${trackingNumber ? `Tracking Number: ${trackingNumber}` : 'Your package is on its way.'}\n\nRegards,\nShreeji Fashion Team`,
    }).catch(err => logger.error(`[updateOrderStatus] Email error: ${err.message}`));

    await sendNotification(
      order.userId,
      'Order Shipped',
      `Your order ${order.id} has been shipped.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      'ORDER_SHIPPED',
      order.id,
      'Order'
    );
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

  // FIX #006: order.totalAmount is stored in paise (Int) — pass directly.
  // COD_ADVANCE is in rupees (constant) — convert to paise.
  const amountToChargePaise = order.isCOD ? Math.round(COD_ADVANCE * 100) : order.totalAmount;

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amountToChargePaise,  // already in paise
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
      
      await sendNotificationToAdmins(
        'New Order Received (via Webhook)',
        `A new order (${order.id}) has been placed and payment confirmed.`,
        'ORDER_PLACED',
        order.id,
        'Order'
      );

      logger.info(`[webhook] Order ${order.id} marked PAID via webhook`);
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

// @desc    Process a refund for an order (Admin only)
// @route   POST /api/orders/:id/refund
// @access  Private/SuperAdmin
const refundOrder = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.paymentStatus !== 'PAID' || !order.razorpayPaymentId) {
    res.status(400);
    throw new Error('Order is not paid or missing payment ID');
  }

  if (order.status === 'CANCELLED' || order.paymentStatus === 'REFUNDED') {
    res.status(400);
    throw new Error('Order is already cancelled or refunded');
  }

  // Amount is in paise, pass directly to Razorpay
  const amountToRefundPaise = order.isCOD ? Math.round(COD_ADVANCE * 100) : order.totalAmount;

  try {
    const refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
      amount: amountToRefundPaise,
      speed: 'normal',
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
    });

    // Notify user
    sendEmail({
      email: order.user.email,
      subject: `Shreeji Fashion - Order Refunded (${order.id})`,
      message: `Hello ${order.user.name || 'Customer'},\n\nYour order (${order.id}) has been cancelled and a refund of ₹${(amountToRefundPaise / 100).toFixed(2)} has been initiated.\nIt will reflect in your account within 5-7 business days.\n\nRegards,\nShreeji Fashion Team`,
    }).catch(err => logger.error(`[refundOrder] Email error: ${err.message}`));

    await sendNotification(
      order.userId,
      'Refund Initiated',
      `A refund of ₹${(amountToRefundPaise / 100).toFixed(2)} for order ${order.id} has been initiated.`,
      'REFUND_INITIATED',
      order.id,
      'Order'
    );

    res.json({ message: 'Refund initiated successfully', refund, order: updatedOrder });
  } catch (error) {
    logger.error(`[refundOrder] Razorpay refund failed for order ${order.id}: ${error.message}`);
    res.status(500);
    throw new Error('Failed to initiate refund with payment gateway');
  }
});

// @desc    Customer cancels order (PENDING or CONFIRMED before shipping)
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, user: true },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id && req.user.role !== 'SUPERADMIN') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.status === 'CANCELLED') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order that has already been ${order.status.toLowerCase()}`);
  }

  let refundResult = null;
  let paymentStatus = order.paymentStatus;

  // If order was paid via online gateway, process refund
  if (order.paymentStatus === 'PAID' && order.razorpayPaymentId) {
    const amountToRefundPaise = order.isCOD ? Math.round(COD_ADVANCE * 100) : order.totalAmount;
    try {
      refundResult = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
        amount: amountToRefundPaise,
        speed: 'normal',
      });
      paymentStatus = 'REFUNDED';
    } catch (refundError) {
      logger.error(`[cancelOrder] Razorpay refund error for order ${order.id}: ${refundError.message}`);
      // If refund fails, order is still marked cancelled, but payment remains to be manually refunded
    }
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: paymentStatus,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return updated;
  });

  sendEmail({
    email: order.user.email,
    subject: `Shreeji Fashion - Order Cancelled (${order.id})`,
    message: `Hello ${order.user.name || 'Customer'},\n\nYour order (${order.id}) has been cancelled successfully.${
      paymentStatus === 'REFUNDED' ? '\nA refund has been initiated and will reflect in your account in 5-7 business days.' : ''
    }\n\nRegards,\nShreeji Fashion Team`,
  }).catch(err => logger.error(`[cancelOrder] Email error: ${err.message}`));

  await sendNotification(
    order.userId,
    'Order Cancelled',
    `Your order ${order.id} has been cancelled.${paymentStatus === 'REFUNDED' ? ' Refund has been initiated.' : ''}`,
    'ORDER_CANCELLED',
    order.id,
    'Order'
  );

  await sendNotificationToAdmins(
    'Order Cancelled by Customer',
    `Order ${order.id} was cancelled by ${order.user.name || 'customer'}.`,
    'ORDER_CANCELLED',
    order.id,
    'Order'
  );

  res.json({
    message: 'Order cancelled successfully',
    order: updatedOrder,
    refund: refundResult,
  });
});

// @desc    Customer requests return for DELIVERED order
// @route   POST /api/orders/:id/return
// @access  Private
const requestOrderReturn = asyncHandler(async (req, res) => {
  const { reason, comments } = req.body;

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    res.status(400);
    throw new Error('Please provide a reason for the return request');
  }

  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: true, items: { include: { product: true } } },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id && req.user.role !== 'SUPERADMIN') {
    res.status(403);
    throw new Error('Not authorized to request return for this order');
  }

  if (order.status !== 'DELIVERED') {
    res.status(400);
    throw new Error('Only delivered orders are eligible for return requests');
  }

  const returnDetails = `Reason: ${reason.trim()}${comments ? `\nComments: ${comments.trim()}` : ''}`;

  await sendNotificationToAdmins(
    'Order Return Request',
    `Customer ${order.user.name || order.user.email} requested return for order ${order.id}.\n${returnDetails}`,
    'RETURN_REQUEST',
    order.id,
    'Order'
  );

  await sendNotification(
    order.userId,
    'Return Request Submitted',
    `Your return request for order ${order.id} has been received. Our team will review it within 24-48 hours.`,
    'RETURN_REQUESTED',
    order.id,
    'Order'
  );

  sendEmail({
    email: order.user.email,
    subject: `Shreeji Fashion - Return Request Received (${order.id})`,
    message: `Hello ${order.user.name || 'Customer'},\n\nWe have received your return request for order ${order.id}.\n\nDetails:\n${returnDetails}\n\nOur team is reviewing your request and will contact you within 24-48 business hours with next steps.\n\nRegards,\nShreeji Fashion Team`,
  }).catch(err => logger.error(`[requestOrderReturn] Email error: ${err.message}`));

  res.json({
    message: 'Return request submitted successfully. Our team will review it shortly.',
    orderId: order.id,
  });
});

// @desc    Download PDF invoice for order (Customer & Admin)
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
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
    throw new Error('Not authorized to access invoice for this order');
  }

  generateInvoicePdf(order, res);
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
  refundOrder,
  cancelOrder,
  requestOrderReturn,
  getOrderInvoice,
};
