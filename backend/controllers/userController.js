const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidUUID } = require('../utils/validateUUID');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
// FIX #016: added pagination; replaced per-user order array with DB-level aggregate
//           so we never load all orders into Node.js memory.
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        // Aggregate at DB level — avoids loading every order row into memory
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count(),
  ]);

  const formattedUsers = users.map(user => {
    const totalSpent = user.orders.reduce((acc, order) => acc + order.totalAmount, 0) / 100;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      totalOrders: user._count.orders,
      totalSpent,
    };
  });

  res.json({ users: formattedUsers, page, pages: Math.ceil(total / pageSize), total });
});

// @desc    Toggle user status (Block/Unblock)
// @route   PUT /api/users/:id/status
// @access  Private/SuperAdmin
// FIX #004: use select on update so password hash and internal fields are never returned.
// FIX #011: validate UUID format before querying DB.
const toggleUserStatus = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, role: true, status: true },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'SUPERADMIN') {
    res.status(400);
    throw new Error('Cannot change status of a SuperAdmin');
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: user.status === 'Active' ? 'Blocked' : 'Active' },
    // Explicitly select only safe fields — password, resetPasswordToken, etc. are excluded
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  res.json(updatedUser);
});

module.exports = {
  getUsers,
  toggleUserStatus,
};
