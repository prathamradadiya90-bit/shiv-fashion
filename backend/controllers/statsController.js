const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard stats and analytics
// @route   GET /api/stats
// @access  Private/SuperAdmin
const getStats = asyncHandler(async (req, res) => {
  // Run independent DB queries concurrently
  const [
    totalUsers, 
    totalOrders, 
    revenueResult, 
    totalProducts, 
    recentOrders, 
    topProductsRaw,
    ordersByStatus,
    allDeliveredOrders,
    allOrdersForTrends,
    categorySalesRaw
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    // Exclude CANCELLED orders from the total order count
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.product.count(),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    // Group order items by product and sum quantities sold
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Status breakdown
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    // Last 6 months orders for trends
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    // Category sales
    prisma.orderItem.findMany({
      select: {
        quantity: true,
        price: true,
        product: { select: { category: true } },
      },
    }),
  ]);

  // Convert paise to rupees
  const totalRevenuePaise = revenueResult._sum.totalAmount ?? 0;
  const totalRevenue = totalRevenuePaise / 100;

  // Batch-fetch top product details
  const topProductIds = topProductsRaw.map(item => item.productId);
  const topProductDetails = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true, category: true, images: { take: 1 } },
      })
    : [];

  const productDetailMap = Object.fromEntries(topProductDetails.map(p => [p.id, p]));

  const topProducts = topProductsRaw
    .map(item => {
      const product = productDetailMap[item.productId];
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price / 100,
        image: product.images?.[0]?.url || '',
        sales: item._sum.quantity,
      };
    })
    .filter(Boolean);

  // Status breakdown dictionary
  const statusMap = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  ordersByStatus.forEach(item => {
    statusMap[item.status] = item._count.id;
  });

  // Calculate monthly trends (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendMap = {};

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
    monthlyTrendMap[key] = { month: key, revenue: 0, orders: 0 };
  }

  allOrdersForTrends.forEach(o => {
    const d = new Date(o.createdAt);
    const key = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
    if (monthlyTrendMap[key]) {
      monthlyTrendMap[key].orders += 1;
      if (o.paymentStatus === 'PAID') {
        monthlyTrendMap[key].revenue += (o.totalAmount || 0) / 100;
      }
    }
  });

  const revenueTrends = Object.values(monthlyTrendMap);

  // Category breakdown
  const categoryMap = {};
  categorySalesRaw.forEach(item => {
    const cat = item.product?.category || 'Traditional';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, revenue: 0, units: 0 };
    }
    categoryMap[cat].units += item.quantity || 1;
    categoryMap[cat].revenue += ((item.price || 0) * (item.quantity || 1)) / 100;
  });
  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

  // Ecommerce ratios
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const fulfillmentRate = totalOrders > 0 ? Math.round((allDeliveredOrders / totalOrders) * 100) : 0;

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue,
    totalProducts,
    averageOrderValue,
    fulfillmentRate,
    topProducts,
    statusBreakdown: statusMap,
    revenueTrends,
    categoryBreakdown,
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      customer: o.user?.name || 'Unknown',
      date: o.createdAt,
      total: o.totalAmount / 100,
      status: o.status,
    })),
  });
});

module.exports = { getStats };

