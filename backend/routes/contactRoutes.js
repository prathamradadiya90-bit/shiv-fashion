const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(submitMessage)
  .get(protect, superAdmin, getMessages);

router.route('/:id/read')
  .put(protect, superAdmin, markAsRead);

router.route('/:id')
  .delete(protect, superAdmin, deleteMessage);

module.exports = router;
