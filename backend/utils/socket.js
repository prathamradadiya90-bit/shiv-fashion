const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const logger = require('./logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      // Look for token in cookies (via headers.cookie string parsing) or handshake auth
      const cookies = socket.handshake.headers.cookie;
      let token = null;

      if (cookies) {
        const jwtCookie = cookies.split('; ').find(row => row.startsWith('jwt='));
        if (jwtCookie) {
          token = jwtCookie.split('=')[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for user ${socket.userId}`);
    
    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
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

module.exports = {
  initSocket,
  getIo,
  sendNotification,
};
