const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

// Standard memory storage so files are held in buffers before Cloudinary streaming
const storage = multer.memoryStorage();

// Validate file types matching requirements: Images, Videos, PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, MP4, MOV, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum file size limit
  }
});

module.exports = upload;
