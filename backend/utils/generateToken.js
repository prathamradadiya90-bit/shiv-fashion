const jwt = require('jsonwebtoken');

const generateToken = (res, userId, tokenVersion = 0) => {
  const token = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Detect production: Vercel sets VERCEL=1 regardless of NODE_ENV value
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,          // Required for sameSite:'none'
    sameSite: isProduction ? 'none' : 'strict', // 'none' allows cross-origin on Vercel
    maxAge: parseInt(process.env.COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
