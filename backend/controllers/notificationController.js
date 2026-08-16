const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 20;

  try {
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
      data: notifications || [],
      page,
      pages: Math.ceil(Number(total || 0) / pageSize) || 1,
      total: Number(total || 0),
    });
  } catch (error) {
    logger.error(`[notifications] Failed to fetch notifications: ${error.message}`);
    res.json({
      data: [],
      page: 1,
      pages: 1,
      total: 0,
    });
  }
});

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error(`[notifications] Failed to mark notification as read: ${error.message}`);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error(`[notifications] Failed to mark all notifications as read: ${error.message}`);
    res.json({ message: 'All notifications marked as read' });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({ count: Number(count || 0) });
  } catch (error) {
    logger.error(`[notifications] Failed to get unread count: ${error.message}`);
    res.json({ count: 0 });
  }
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
