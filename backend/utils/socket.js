const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const logger = require('./logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
        : ['https://shiv-fashion.vercel.app'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      // Look for token in auth payload or cookies
      let token = socket.handshake.auth?.token;

      if (!token) {
        const cookies = socket.handshake.headers.cookie;
        if (cookies) {
          const jwtCookie = cookies.split('; ').find(row => row.startsWith('jwt='));
          if (jwtCookie) {
            token = jwtCookie.split('=')[1];
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('[socket] JWT verification failed:', error);
      next(new Error(`Authentication error: Invalid token - ${error.message}`));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} for user ${socket.userId}`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to create DB notification and emit real-time event
const sendNotification = async (userId, title, body, type, referenceId = null, referenceType = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        referenceId,
        referenceType,
      }
    });

    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    logger.error(`Error sending notification: ${error.message}`);
  }
};

// Helper function to create DB notification and emit real-time event to all admins
const sendNotificationToAdmins = async (title, body, type, referenceId = null, referenceType = null) => {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'SUPERADMIN' } });

    if (admins.length > 0) {
      const notifications = await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              title,
              body,
              type,
              referenceId,
              referenceType,
            }
          })
        )
      );

      if (io) {
        admins.forEach((admin, index) => {
          io.to(`user_${admin.id}`).emit('new_notification', notifications[index]);
        });
      }
    }
  } catch (error) {
    logger.error(`Error sending notification to admins: ${error.message}`);
  }
};

module.exports = {
  initSocket,
  getIo,
  sendNotification,
  sendNotificationToAdmins,
};
