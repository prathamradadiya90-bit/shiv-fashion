const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 20;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId: req.user.id } }),
  ]);

  res.json({
    data: notifications,
    page,
    pages: Math.ceil(Number(total) / pageSize),
    total: Number(total),
  });
});

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json(updated);
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: {
      userId: req.user.id,
      isRead: false,
    },
  });

  res.json({ count: Number(count) });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
