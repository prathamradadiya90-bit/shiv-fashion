const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  // Always prefer Authorization header (Redux state) over cookies to avoid stale cookie issues
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, tokenVersion: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Not authorized, your account has been blocked' });
    }

    if (user.tokenVersion !== (decoded.tokenVersion ?? 0)) {
      return res.status(401).json({ message: 'Not authorized, session expired. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    // Always return JSON — never let an unhandled error propagate (which could return HTML)
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SUPERADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, superAdmin };
