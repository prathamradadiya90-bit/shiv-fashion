const prisma = require('../config/db');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle user status (Block/Unblock)
// @route   PUT /api/users/:id/status
// @access  Private/SuperAdmin
const toggleUserStatus = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  toggleUserStatus
};
