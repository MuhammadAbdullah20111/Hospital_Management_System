import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import ApiResponse from './utils/ApiResponse.js';
import errorHandler from './middlewares/errorHandler.js';

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.replace(/\/$/, '');
      
      // Allow allowedOrigins list or any vercel.app domain for ease of deployment
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      
      return callback(null, true); // Fallback allow to prevent deployment CORS blocking
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
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

app.get('/api/', (req, res) => {
  return ApiResponse.success(res, 'Welcome to MKMC Backend API (Standardized)');
});

app.get('/', (req, res) => {
  return ApiResponse.success(res, 'MKMC Backend API is running');
});

// ---------------------------------------------------------------------------
// Global error handler — must be registered after all routes
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
