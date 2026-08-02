const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please provide name, email, and message');
  }

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json(messages);
});

// @desc    Mark a message as read
// @route   PUT /api/contact/:id/read
// @access  Private/SuperAdmin
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });

  res.status(200).json(message);
});

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/SuperAdmin
const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.contactMessage.delete({
    where: { id },
  });
  res.status(200).json({ message: 'Message deleted' });
});

module.exports = {
  submitMessage,
  getMessages,
  markAsRead,
  deleteMessage,
};
