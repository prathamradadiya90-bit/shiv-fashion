const jwt = require('jsonwebtoken');

const isValidExpiresIn = (val) => {
  return typeof val === 'string' && /^(\d+)[smhdwy]?$/i.test(val.trim());
};

const generateToken = (res, userId, tokenVersion = 0) => {
  const rawExpires = process.env.JWT_EXPIRES_IN;
  const expiresIn = (rawExpires && isValidExpiresIn(rawExpires)) ? rawExpires.trim() : '7d';

  const token = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET || 'secret', {
    expiresIn,
  });

  // Detect production: Vercel sets VERCEL=1 regardless of NODE_ENV value
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  const rawCookieDays = parseInt(process.env.COOKIE_EXPIRES_IN, 10);
  const cookieDays = (!isNaN(rawCookieDays) && rawCookieDays > 0) ? rawCookieDays : 7;

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,          // Required for sameSite:'none'
    sameSite: isProduction ? 'none' : 'strict', // 'none' allows cross-origin on Vercel
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = generateToken;
