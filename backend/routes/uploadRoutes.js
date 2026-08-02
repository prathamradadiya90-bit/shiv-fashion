const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const { protect, superAdmin } = require('../middleware/authMiddleware');
const fs = require('fs');

const asyncHandler = require('../middleware/asyncHandler');

router.post('/', protect, superAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'shreejifashion/products',
    });

    // Remove the file from local storage
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    throw error;
  }
}));

module.exports = router;
