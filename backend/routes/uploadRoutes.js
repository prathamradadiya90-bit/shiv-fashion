const express = require('express');
const router = express.Router();
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const { protect, superAdmin } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

/**
 * Helper: non-blocking async file removal.
 * Silently ignores "file not found" errors so a missing temp file
 * never crashes the process; logs everything else for diagnostics.
 */
const removeTempFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error(`[upload] Failed to remove temp file ${filePath}: ${err.message}`);
    }
  }
};

router.post(
  '/',
  protect,
  superAdmin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'shreejifashion/products',
      });

      // Remove temp file asynchronously — does not block the response
      removeTempFile(req.file.path);

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      // Clean up temp file even on Cloudinary failure
      removeTempFile(req.file.path);
      throw error;
    }
  })
);

module.exports = router;
