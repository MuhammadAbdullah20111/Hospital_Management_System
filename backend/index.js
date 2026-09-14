/**
 * Local Development / Traditional Server Entry Point
 * ────────────────────────────────────────────────────
 * This file is used for local development (npm run dev / npm start) and
 * any traditional VPS/server deployment where a persistent process is available.
 *
 * It imports the shared Express application from app.js and adds:
 *   - database connection with retry logic (suitable for a long-running process)
 *   - startup permission migrations
 *   - app.listen() on the configured PORT
 *   - startBedAutomation() background service
 *   - periodic biometric device synchronization via setInterval
 *
 * For Vercel serverless deployment, see backend/api/index.js instead.
 */

import app from './app.js';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import prisma from './config/prismaClient.js';
import { startBedAutomation } from './utils/bedAutomation.js';
import BiometricService from './services/biometricService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

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

      // Start background services (local/persistent server only)
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

startServer();
