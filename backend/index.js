import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/database.js';
import ApiResponse from './utils/ApiResponse.js';
import errorHandler from './middlewares/errorHandler.js';

import adminRoutes from './routes/admin/index.js';
import staffRoutes from './routes/staff/index.js';
import webRoutes from './routes/web/index.js';
import publicRoutes from './routes/publicRoutes.js';
import { startBedAutomation } from './utils/bedAutomation.js';
import prisma from './config/prismaClient.js';
import BiometricService from './services/biometricService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/web', webRoutes);
app.use('/api', publicRoutes);

app.get('/api/', (req, res) => {
  return ApiResponse.success(res, 'Welcome to MKMC Backend API (Standardized)');
});

const runStartupMigrations = async () => {
  try {
    const financePerms = ['view-finance', 'create-finance', 'edit-finance', 'delete-finance'];
    for (const name of financePerms) {
      await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
    }
    // Add ward, room, bed permissions
    const inpatientPerms = [];
    for (const entity of ['ward', 'room', 'bed']) {
      for (const action of ['view', 'create', 'edit', 'delete']) {
        inpatientPerms.push(`${action}-${entity}`);
      }
    }
    for (const name of inpatientPerms) {
      await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
    }

    // Assign all ward, room, bed permissions to ADMIN role
    const adminRole = await prisma.role.findFirst({ where: { name: { equals: 'ADMIN', mode: 'insensitive' } } });
    if (adminRole) {
      for (const pname of inpatientPerms) {
        const perm = await prisma.permission.findUnique({ where: { name: pname } });
        if (perm) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: perm.id }
          });
        }
      }
    }
    console.log('[Migration] Ward, Room, and Bed permissions assigned.');

    // Remove legacy view-payment permissions if they exist
    for (const name of ['view-payment','create-payment','edit-payment','delete-payment']) {
      const old = await prisma.permission.findUnique({ where: { name } });
      if (old) {
        await prisma.rolePermission.deleteMany({ where: { permissionId: old.id } });
        await prisma.permission.delete({ where: { id: old.id } });
      }
    }
  } catch (e) {
    console.warn('[Migration] Finance permission migration skipped:', e.message);
  }
};

const connectWithRetry = async (maxRetries = 10, delayMs = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Database] Connecting to PostgreSQL database (attempt ${attempt}/${maxRetries})...`);
      await pool.query('SELECT NOW()');
      console.log('Database connection successful');
      return;
    } catch (err) {
      console.error(`[Database] Connection attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        throw err;
      }
      console.log(`[Database] Waiting ${delayMs / 1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

const startServer = async () => {
  try {
    await connectWithRetry();

    await runStartupMigrations();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Start background services
      startBedAutomation();

      // Periodic Biometric device logs sync (every 30 seconds to keep system database synced within 1 minute)
      setInterval(async () => {
        try {
          console.log(`[Scheduler] [${new Date().toISOString()}] Triggering periodic biometric sync...`);
          await BiometricService.syncAllDevices();
        } catch (err) {
          console.error(`[Scheduler] [${new Date().toISOString()}] Biometric sync error:`, err.message);
        }
      }, 30 * 1000);
    });
  } catch (error) {
    console.error('Failed to connect to the database after maximum retries:', error);
    process.exit(1);
  }
};

app.use(errorHandler);

startServer();
