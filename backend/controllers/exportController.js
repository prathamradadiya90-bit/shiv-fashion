const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { Parser } = require('json2csv');

// @desc    Export users as CSV
// @route   GET /api/export/users
// @access  Private/SuperAdmin
const exportUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (users.length === 0) {
    return res.status(404).send('No users found');
  }

  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(users);

  res.header('Content-Type', 'text/csv');
  res.attachment('users_export.csv');
  res.send(csv);
});

// @desc    Export orders as CSV
// @route   GET /api/export/orders
// @access  Private/SuperAdmin
const exportOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (orders.length === 0) {
    return res.status(404).send('No orders found');
  }

  // Format data for CSV
  const data = orders.map(order => ({
    orderId: order.id,
    customerName: order.user?.name || 'N/A',
    customerEmail: order.user?.email || 'N/A',
    totalAmount: (order.totalAmount / 100).toFixed(2), // converted from paise
    status: order.status,
    paymentStatus: order.paymentStatus,
    isCOD: order.isCOD ? 'Yes' : 'No',
    createdAt: order.createdAt,
  }));

  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment('orders_export.csv');
  res.send(csv);
});

module.exports = {
  exportUsers,
  exportOrders,
};
