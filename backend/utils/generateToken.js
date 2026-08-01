const jwt = require('jsonwebtoken');

const generateToken = (res, userId, tokenVersion = 0) => {
  const token = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Must be true for sameSite 'none'
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict', // Allow cross-origin on Vercel
    maxAge: parseInt(process.env.COOKIE_EXPIRES_IN || '30') * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateToken;
