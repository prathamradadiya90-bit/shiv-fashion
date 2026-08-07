const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error('A valid email address is required');
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    res.status(400);
    throw new Error('Message is required');
  }

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : null,
      message: message.trim(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: contactMessage,
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/SuperAdmin
const getMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json(messages);
});

// @desc    Mark a message as read
// @route   PUT /api/contact/:id/read
// @access  Private/SuperAdmin
const markAsRead = asyncHandler(async (req, res) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404);
    throw new Error('Message not found');
  }

  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.status(200).json(message);
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/SuperAdmin
const deleteMessage = asyncHandler(async (req, res) => {
  const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404);
    throw new Error('Message not found');
  }

  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  res.status(200).json({ message: 'Message deleted' });
});

module.exports = {
  submitMessage,
  getMessages,
  markAsRead,
  deleteMessage,
};
