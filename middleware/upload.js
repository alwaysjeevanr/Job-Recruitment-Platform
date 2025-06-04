const multer = require('multer');
const path = require('path');

// Accept only PDF
const storage = multer.memoryStorage(); // Use memory storage to upload directly to Cloudinary
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDFs are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
