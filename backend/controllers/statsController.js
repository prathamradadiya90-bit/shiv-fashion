const prisma = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private/SuperAdmin
const getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalOrders = await prisma.order.count();
    
    const orders = await prisma.order.findMany({
      select: { totalAmount: true }
    });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const totalProducts = await prisma.product.count();

    // Latest 5 orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customer: o.user.name,
        date: o.createdAt,
        total: o.totalAmount,
        status: o.status
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getStats
};
