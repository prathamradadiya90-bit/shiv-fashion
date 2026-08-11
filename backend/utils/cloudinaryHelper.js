const cloudinary = require('../config/cloudinary');
const logger = require('./logger');

const deleteImages = async (images) => {
  if (!images || images.length === 0) return;
  
  const deletePromises = images.map(image => {
    if (image.publicId) {
      return cloudinary.uploader.destroy(image.publicId).catch(err => {
        logger.error(`[cloudinary] Failed to delete image ${image.publicId}: ${err.message}`);
      });
    }
    return Promise.resolve();
  });

  await Promise.all(deletePromises);
};

module.exports = { deleteImages };
