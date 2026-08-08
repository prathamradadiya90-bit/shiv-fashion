const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private/SuperAdmin
const getStats = asyncHandler(async (req, res) => {
  // Run independent DB queries concurrently
  const [totalUsers, totalOrders, revenueResult, totalProducts, recentOrders, topProductsRaw] =
    await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // FIX #019: exclude CANCELLED orders from the total order count so the
      // admin dashboard reflects orders that were actually fulfilled or in progress.
      prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      // Group order items by product and sum quantities sold
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 4,
      }),
    ]);

  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  // Batch-fetch top product details in ONE query (no N+1)
  const topProductIds = topProductsRaw.map(item => item.productId);
  const topProductDetails = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true, images: { take: 1 } },
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
        price: product.price,
        image: product.images?.[0]?.url || '',
        sales: item._sum.quantity,
      };
    })
    .filter(Boolean);

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue,
    totalProducts,
    topProducts,
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      customer: o.user?.name || 'Unknown',
      date: o.createdAt,
      total: o.totalAmount,
      status: o.status,
    })),
  });
});

module.exports = { getStats };
