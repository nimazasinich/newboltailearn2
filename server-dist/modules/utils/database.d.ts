/**
 * Database utilities that use the DatabaseManager singleton
 * This prevents race conditions and ensures consistent database access
 */
/**
 * Perform database maintenance using the singleton DatabaseManager
 */
export declare function performDatabaseMaintenance(): Promise<void>;
/**
 * Get database statistics using the singleton
 */
export declare function getDatabaseStatistics(): any;
/**
 * Create a checkpoint (for WAL mode)
 */
export declare function createCheckpoint(mode?: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE'): void;
/**
 * Execute multiple statements in a transaction using the singleton
 */
export declare function batchExecute(statements: string[]): void;
/**
 * Execute a function within a transaction using the singleton
 */
export declare function executeTransaction<T>(fn: () => T): T;
/**
 * Get the singleton database instance
 * @deprecated Use DatabaseManager.getConnection() directly
 */
export declare function getDatabaseInstance(): any;
/**
 * Re-export the DatabaseManager singleton for convenience
 */
export { default as DatabaseManager } from '../../database/DatabaseManager';
/**
 * Legacy compatibility - export database manager reference
 * @deprecated Use DatabaseManager singleton directly
 */
export declare const dbManager: {
    getDatabase: () => any;
    getStatistics: typeof getDatabaseStatistics;
    performMaintenance: typeof performDatabaseMaintenance;
    checkpoint: typeof createCheckpoint;
    batchExecute: typeof batchExecute;
    transaction: typeof executeTransaction;
    close: () => any;
};
//# sourceMappingURL=database.d.ts.map