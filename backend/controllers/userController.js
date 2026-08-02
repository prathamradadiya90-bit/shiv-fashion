const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      createdAt: true,
      orders: {
        select: {
          totalAmount: true
        }
      }
    }
  });

  // Map to include derived stats
  const formattedUsers = users.map(user => {
    const totalOrders = user.orders.length;
    const totalSpent = user.orders.reduce((acc, order) => acc + order.totalAmount, 0);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      totalOrders,
      totalSpent,
      status: user.status
    };
  });

  res.json(formattedUsers);
});

// @desc    Toggle user status (Block/Unblock)
// @route   PUT /api/users/:id/status
// @access  Private/SuperAdmin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

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
    data: { status: user.status === 'Active' ? 'Blocked' : 'Active' }
  });

  res.json(updatedUser);
});

module.exports = {
  getUsers,
  toggleUserStatus
};
