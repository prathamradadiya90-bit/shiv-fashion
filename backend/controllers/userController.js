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
        status: 'Active' // Hardcoded since we didn't add status to schema
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers
};
