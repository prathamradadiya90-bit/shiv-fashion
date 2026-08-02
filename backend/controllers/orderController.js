const prisma = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order & razorpay order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate total amount from DB to prevent tampering
  let totalAmount = 0;
  const itemsForDb = [];

  for (let item of orderItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.productId} not found`);
    }
    
    let finalPrice = product.price;
    if (product.discount > 0) {
       finalPrice = product.price - (product.price * (product.discount / 100));
    }

    totalAmount += finalPrice * item.quantity;
    itemsForDb.push({
      productId: product.id,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: finalPrice
    });
  }

  // Add Shipping and Tax
  const shippingPrice = totalAmount > 5000 ? 0 : 250;
  const taxPrice = Number((0.18 * totalAmount).toFixed(2));
  
  let finalTotalAmount = totalAmount + shippingPrice + taxPrice;

  // Handle Discount via Server-Side Coupon Verification
  const { couponCode, isCOD } = req.body;
  let calculatedDiscount = 0;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (
      coupon && 
      coupon.isActive && 
      new Date() <= new Date(coupon.expiryDate) && 
      finalTotalAmount >= coupon.minOrderValue
    ) {
      if (coupon.discountType === 'PERCENTAGE') {
        calculatedDiscount = (finalTotalAmount * coupon.value) / 100;
      } else {
        calculatedDiscount = coupon.value;
      }
    }
  }

  if (calculatedDiscount > 0) {
    finalTotalAmount -= calculatedDiscount;
  }

  finalTotalAmount = Number(finalTotalAmount.toFixed(2));

  const amountToCharge = isCOD ? 500 : finalTotalAmount;

  const options = {
    amount: Math.round(amountToCharge * 100), // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  // Save payment method info inside shippingAddress JSON
  const enhancedShippingAddress = {
    ...shippingAddress,
    paymentMethod: isCOD ? 'COD' : 'PREPAID'
  };

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      totalAmount: finalTotalAmount,
      shippingAddress: enhancedShippingAddress,
      razorpayOrderId: razorpayOrder.id,
      items: {
        create: itemsForDb
      }
    },
    include: { items: true }
  });

  res.status(201).json({ order, razorpayOrder });
});

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/pay
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpaySignature;

  if (isAuthentic) {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId,
        razorpaySignature,
      },
      include: { user: true }
    });
    
    // Send Confirmation Email
    const emailMessage = `
      Hello ${updatedOrder.user.name},
      
      Thank you for shopping with Shreeji Fashion!
      Your order (${updatedOrder.id}) has been confirmed and payment is successful.
      Total Amount: ₹${updatedOrder.totalAmount}
      
      We will notify you once your order is shipped.
      
      Regards,
      Shreeji Fashion Team
    `;

    await sendEmail({
      email: updatedOrder.user.email,
      subject: `Shreeji Fashion - Order Confirmed (${updatedOrder.id})`,
      message: emailMessage,
    });

    res.json({ message: 'Payment verified successfully' });
  } else {
    res.status(400);
    throw new Error('Invalid signature');
  }
});

// @desc    Handle Razorpay redirect callback from mobile payments
// @route   POST /api/orders/payment-callback
// @access  Public
const paymentCallback = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
  }

  const order = await prisma.order.findFirst({ where: { razorpayOrderId: razorpay_order_id } });

  if (!order) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature && order.paymentStatus !== 'PAID') {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: { user: true }
    });
    
    const emailMessage = `
      Hello ${updatedOrder.user.name},
      
      Thank you for shopping with Shreeji Fashion!
      Your order (${updatedOrder.id}) has been confirmed and payment is successful.
      Total Amount: ₹${updatedOrder.totalAmount}
      
      We will notify you once your order is shipped.
    `;

    await sendEmail({
      email: updatedOrder.user.email,
      subject: `Shreeji Fashion - Order Confirmed (${updatedOrder.id})`,
      message: emailMessage,
    }).catch(console.error); // Ignore email errors here to prevent redirect failure
  }

  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/order/${order.id}`);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { 
      user: { select: { name: true, email: true } },
      items: { include: { product: true } } 
    }
  });

  if (order) {
    // Security check: Only the user who placed the order or an Admin can view it
    if (order.userId !== req.user.id && req.user.role !== 'SUPERADMIN') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/SuperAdmin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/SuperAdmin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  
  const existingOrder = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existingOrder) {
    res.status(404);
    throw new Error('Order not found');
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, trackingNumber },
    include: { user: true }
  });

  // Send shipment notification email if marked as SHIPPED
  if (status === 'SHIPPED') {
    const emailMessage = `
      Hello ${order.user.name},
      
      Great news! Your order (${order.id}) has been shipped.
      ${trackingNumber ? `Your Tracking Number is: ${trackingNumber}` : 'Your package is on its way.'}
      
      You can track your order status in your account.
      
      Regards,
      Shreeji Fashion Team
    `;

    await sendEmail({
      email: order.user.email,
      subject: `Shreeji Fashion - Order Shipped (${order.id})`,
      message: emailMessage,
    });
  }

  res.json(order);
});

// @desc    Retry payment for existing order
// @route   POST /api/orders/:id/retry-pay
// @access  Private
const retryPayment = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }

  if (order.paymentStatus === 'PAID') {
    res.status(400);
    throw new Error('Order is already paid');
  }

  const options = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `receipt_retry_${Date.now()}`
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  // Update order with new razorpayOrderId
  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id }
  });

  res.json({ razorpayOrder, order });
});

// @desc    Razorpay Webhook handler
// @route   POST /api/orders/webhook
// @access  Public
const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  // Validate signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature === signature) {
    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      
      // Find order
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId: razorpayOrderId }
      });

      if (order && order.paymentStatus !== 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId: razorpayPaymentId,
          }
        });
        console.log(`Order ${order.id} marked as PAID via webhook`);
      }
    }
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400);
    throw new Error('Invalid signature');
  }
});

// @desc    Track order
// @route   POST /api/orders/track
// @access  Public
const trackOrder = asyncHandler(async (req, res) => {
  const { type, value } = req.body;
  
  if (!type || !value) {
    res.status(400);
    throw new Error('Please provide type and value');
  }

  let orders = [];

  if (type === 'orderId') {
    const order = await prisma.order.findUnique({
      where: { id: value },
      include: { items: { include: { product: { select: { name: true, images: true } } } } }
    });
    if (order) orders = [order];
  } 
  else if (type === 'mobile') {
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      res.status(400);
      throw new Error('Invalid mobile number');
    }
    
    const searchPhone = cleanPhone.slice(-10);

    // Optimize: just query orders directly through the user relation
    orders = await prisma.order.findMany({
      where: { user: { phone: { contains: searchPhone } } },
      include: { items: { include: { product: { select: { name: true, images: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5 
    });
  } else {
    res.status(400);
    throw new Error('Invalid track type');
  }

  if (orders.length === 0) {
    res.status(404);
    throw new Error('No orders found matching this detail');
  }

  // Mask PII 
  const maskedOrders = orders.map(order => {
    let maskedAddress = {};
    if (order.shippingAddress) {
      maskedAddress = {
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode
      };
    }
    
    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber,
      shippingAddress: maskedAddress, 
      items: order.items.map(item => ({
        name: item.product?.name,
        image: item.product?.images?.[0]?.url,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      }))
    };
  });

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
