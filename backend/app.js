import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import ApiResponse from './utils/ApiResponse.js';
import errorHandler from './middlewares/errorHandler.js';
import { pool } from './config/database.js';

import adminRoutes from './routes/admin/index.js';
import staffRoutes from './routes/staff/index.js';
import webRoutes from './routes/web/index.js';
import publicRoutes from './routes/publicRoutes.js';

dotenv.config();

const app = express();

// ---------------------------------------------------------------------------
// CORS
// Allowed origins: local dev frontend + production Vercel frontend.
// FRONTEND_URL is set as a Vercel environment variable in the backend project.
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Static file serving for uploads.
// NOTE: On Vercel, the filesystem is ephemeral and read-only in production.
// Files uploaded via multer (profile images, reports) will NOT persist between
// serverless function invocations. This route is preserved for local development.
// For production-persistent uploads, migrate to a cloud storage provider
// (e.g. Vercel Blob, Cloudinary, AWS S3).
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ---------------------------------------------------------------------------
// API Routes — preserved exactly as in original index.js
// ---------------------------------------------------------------------------
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/web', webRoutes);
app.use('/api', publicRoutes);

app.get('/api/', async (req, res) => {
  let dbStatus = { connected: false, message: 'Disconnected' };
  try {
    await pool.query('SELECT 1');
    dbStatus = { connected: true, message: 'Connected' };
  } catch (error) {
    dbStatus = { connected: false, error: error.message };
  }

  return ApiResponse.success(res, 'Welcome to MKMC Backend API (Standardized)', {
    database: dbStatus,
  });
});

app.get('/', (req, res) => {
  return ApiResponse.success(res, 'MKMC Backend API is running');
});

// ---------------------------------------------------------------------------
// Global error handler — must be registered after all routes
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
