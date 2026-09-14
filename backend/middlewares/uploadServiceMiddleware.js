import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists.
// NOTE: On Vercel the filesystem is read-only (/var/task) so mkdir will fail.
// The try-catch prevents a crash at import time — uploads are not persistent on Vercel.
const uploadDir = path.join(process.cwd(), 'uploads', 'services');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Upload] Could not create services upload directory (expected on Vercel):', err.message);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (Only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadService = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

export default uploadService;
