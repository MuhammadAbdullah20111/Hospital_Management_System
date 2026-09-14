import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists.
// NOTE: On Vercel the filesystem is read-only (/var/task) so mkdir will fail.
// The try-catch prevents a crash at import time — uploads are not persistent on Vercel.
const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Upload] Could not create reports upload directory (expected on Vercel):', err.message);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (Images and PDFs allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

const uploadReport = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

export default uploadReport;
