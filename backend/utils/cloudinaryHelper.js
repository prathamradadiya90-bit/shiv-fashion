const cloudinary = require('../config/cloudinary');

const deleteImages = async (images) => {
  if (!images || images.length === 0) return;
  
  const deletePromises = images.map(image => {
    if (image.publicId) {
      return cloudinary.uploader.destroy(image.publicId).catch(err => {
        console.error('Failed to delete image from Cloudinary', err);
      });
    }
    return Promise.resolve();
  });

  await Promise.all(deletePromises);
};

module.exports = { deleteImages };
