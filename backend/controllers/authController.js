const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');
const { RESET_TOKEN_EXPIRES_MINUTES } = require('../utils/constants');

// Simple RFC-5322–inspired email regex used for server-side validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // ── Required field checks ──────────────────────────────────────────────────
  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400);
    throw new Error('Name is required');
  }
  if (name.length > 100) {
    res.status(400);
    throw new Error('Name cannot exceed 100 characters');
  }
  if (!email || typeof email !== 'string') {
    res.status(400);
    throw new Error('Email is required');
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400);
    throw new Error('Password is required and must be at least 6 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role: 'CUSTOMER',
    },
  });

  if (user) {
    const token = generateToken(res, user.id, user.tokenVersion);
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400);
    throw new Error('Email is required');
  }
  if (!password || typeof password !== 'string') {
    res.status(400);
    throw new Error('Password is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user && user.password && (await bcrypt.compare(password, user.password))) {
    if (user.status === 'Blocked') {
      res.status(403);
      throw new Error('Your account has been blocked by the admin');
    }
    const token = generateToken(res, user.id, user.tokenVersion);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Do NOT include orders in the profile response — it can be megabytes of data.
  // Orders are fetched by the dedicated /api/orders/myorders endpoint.
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      addresses: true,
      wishlist: {
        include: { images: true },
      },
    },
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // Validate email format if caller is changing it
  if (req.body.email !== undefined) {
    if (typeof req.body.email !== 'string' || !EMAIL_REGEX.test(req.body.email.trim())) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }
  }

  if (req.body.name && typeof req.body.name === 'string' && req.body.name.length > 100) {
    res.status(400);
    throw new Error('Name cannot exceed 100 characters');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const dataToUpdate = {
    name: req.body.name ? req.body.name.trim() : user.name,
    email: req.body.email ? req.body.email.trim().toLowerCase() : user.email,
    phone: req.body.phone !== undefined ? req.body.phone : user.phone,
  };

  if (req.body.email && dataToUpdate.email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: dataToUpdate.email } });
    if (emailExists) {
      res.status(400);
      throw new Error('Email is already in use');
    }
  }

  if (req.body.password) {
    if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }
    const salt = await bcrypt.genSalt(10);
    dataToUpdate.password = await bcrypt.hash(req.body.password, salt);
    dataToUpdate.tokenVersion = { increment: 1 };
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: dataToUpdate,
  });

  // If password was changed, re-issue token with new version to keep current device logged in
  let token;
  if (req.body.password) {
    token = generateToken(res, updatedUser.id, updatedUser.tokenVersion);
  }

  res.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    ...(token && { token }),
  });
});

// @desc    Logout user from ALL devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAllDevices = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { tokenVersion: { increment: 1 } },
  });

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out from all devices successfully' });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Return the same message whether or not the user exists — prevents user enumeration
  if (!user) {
    return res.status(200).json({ message: 'If that email is registered you will receive a reset link shortly' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // FIX #017: expiry is driven by RESET_TOKEN_EXPIRES_MINUTES constant (env-configurable)
  const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { resetPasswordToken, resetPasswordExpires },
  });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `You requested a password reset. Click the link below:\n\n${resetUrl}\n\nThis link expires in ${RESET_TOKEN_EXPIRES_MINUTES} minutes. If you did not request this, please ignore this email.`;
  const html = `<p>You requested a password reset. Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#800020;color:white;text-decoration:none;border-radius:5px;margin:15px 0;">Reset Password</a>
                <p>If you didn't request this, please ignore this email. The link is valid for ${RESET_TOKEN_EXPIRES_MINUTES} minutes.</p>`;

  const emailSent = await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message,
    html,
  });

  if (!emailSent) {
    // Roll back the token so the user can try again
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null, resetPasswordExpires: null },
    });
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }

  res.status(200).json({ message: 'If that email is registered you will receive a reset link shortly' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      tokenVersion: { increment: 1 },
    },
  });

  res.status(200).json({ message: 'Password reset successful' });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
};
