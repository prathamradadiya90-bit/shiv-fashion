const multer = require('multer');
const path = require('path');

// Multer config for temporary storage before uploading to Cloudinary
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// FIX #018: use an explicit allowlist with strict equality instead of a regex
// substring match. The old regex (/jpg|jpeg|png|webp/) would match any MIME
// type string that *contains* those substrings, which could be abused.
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const checkFileType = (file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const mimeAllowed = ALLOWED_MIMETYPES.includes(file.mimetype);

  if (extAllowed && mimeAllowed) {
    return cb(null, true);
  }
  cb(new Error('Images only (jpg, jpeg, png, webp)'));
};

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

module.exports = upload;
