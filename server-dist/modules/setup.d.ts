import { Application } from 'express';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
/**
 * Setup all modular components
 * This function is called from server/index.ts to wire up all modules
 * without breaking the existing structure
 */
export declare function setupModules(app: Application, db: Database.Database, io: Server): void;
/**
 * Export configuration for use in server/index.ts
 */
export { config } from './security/config';
export { metricsCollector } from './monitoring/metrics';
//# sourceMappingURL=setup.d.ts.map