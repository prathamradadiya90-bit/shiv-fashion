const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  // Fallback to Authorization header if cookie is blocked
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true, tokenVersion: true }
      });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (req.user.status === 'Blocked') {
        res.status(403);
        throw new Error('Not authorized, user is blocked');
      }

      if (req.user.tokenVersion !== decoded.tokenVersion) {
        res.status(401);
        throw new Error('Not authorized, token revoked');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error(error.message || 'Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SUPERADMIN') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};

module.exports = { protect, superAdmin };
