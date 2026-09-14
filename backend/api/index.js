/**
 * Vercel Serverless Entry Point
 * ─────────────────────────────
 * This file is used ONLY by Vercel (@vercel/node).
 * It imports the shared Express app and exports it for the serverless runtime.
 *
 * It intentionally does NOT:
 *   - call app.listen()       → Vercel manages the HTTP server lifecycle
 *   - start startBedAutomation()  → requires a persistent background process (not available in serverless)
 *   - start the biometric setInterval sync  → requires persistent process + local network access to ZK devices
 *   - call runStartupMigrations()  → run migrations once via CLI: `npx prisma migrate deploy`
 *   - call connectWithRetry()  → Prisma/pg connects on demand; a 50-second retry loop is
 *                                incompatible with Vercel's function execution timeout
 *
 * Background services (bed automation, biometric sync) remain available in
 * backend/index.js for traditional server / local development deployments.
 */

import app from '../app.js';

export default app;
