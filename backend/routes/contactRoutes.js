const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, markAsRead } = require('../controllers/contactController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(submitMessage)
  .get(protect, superAdmin, getMessages);

router.route('/:id/read')
  .put(protect, superAdmin, markAsRead);

module.exports = router;
