const prisma = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order & razorpay order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    try {
      // Calculate total amount from DB to prevent tampering
      let totalAmount = 0;
      const itemsForDb = [];

      for (let item of orderItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
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

      // Create Razorpay order
      const options = {
        amount: Math.round(totalAmount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          shippingAddress,
          razorpayOrderId: razorpayOrder.id,
          items: {
            create: itemsForDb
          }
        },
        include: { items: true }
      });

      res.status(201).json({ order, razorpayOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/pay
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  try {
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
        
        Thank you for shopping with Shiv Fashion!
        Your order (${updatedOrder.id}) has been confirmed and payment is successful.
        Total Amount: ₹${updatedOrder.totalAmount}
        
        We will notify you once your order is shipped.
        
        Regards,
        Shiv Fashion Team
      `;

      await sendEmail({
        email: updatedOrder.user.email,
        subject: `Shiv Fashion - Order Confirmed (${updatedOrder.id})`,
        message: emailMessage,
      });

      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400);
      throw new Error('Invalid signature');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/SuperAdmin
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/SuperAdmin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
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
        Shiv Fashion Team
      `;

      await sendEmail({
        email: order.user.email,
        subject: `Shiv Fashion - Order Shipped (${order.id})`,
        message: emailMessage,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Retry payment for existing order
// @route   POST /api/orders/:id/retry-pay
// @access  Private
const retryPayment = async (req, res) => {
  try {
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

    // If order already has a razorpayOrderId, we can just return it,
    // OR create a new one to be safe if it expired. We'll create a new one just in case.
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Razorpay Webhook handler
// @route   POST /api/orders/webhook
// @access  Public
const razorpayWebhook = async (req, res) => {
  try {
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
      res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook failed' });
  }
};

module.exports = {
  addOrderItems,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  retryPayment,
  razorpayWebhook,
};
