// middleware/uploadMiddleware.js
// Purpose: Handles food image uploads using Multer.
// Stores images in backend/uploads and validates file types (JPG, JPEG, PNG) and file size (max 5MB).

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads folder exists
const uploadDirectory = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// 1. Storage Configuration: specifies destination folder and unique filename
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    // Unique filename: food-<timestamp>-<random number>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `food-${uniqueSuffix}${extension}`);
  },
});

// 2. File Filter: accepts only JPG, JPEG, and PNG files
const fileFilter = (req, file, callback) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  // Check file extension and MIME type
  if (allowedExtensions.includes(ext) && (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

// 3. Multer Instance with 5MB file size limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

module.exports = upload;
