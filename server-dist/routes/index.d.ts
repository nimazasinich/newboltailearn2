import { Router } from 'express';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
/**
 * Main API Router
 * Mounts all API routes under /api prefix
 */
export default function createApiRouter(io: Server, db: Database.Database): Router;
//# sourceMappingURL=index.d.ts.map