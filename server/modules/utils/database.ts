import DatabaseManager from '../../database/DatabaseManager';
import { config } from '../security/config';

/**
 * Database utilities that use the DatabaseManager singleton
 * This prevents race conditions and ensures consistent database access
 */

/**
 * Perform database maintenance using the singleton DatabaseManager
 */
export async function performDatabaseMaintenance(): Promise<void> {
  try {
    console.log('Starting database maintenance...');
    
    const db = DatabaseManager.getConnection();
    
    // Analyze tables for query optimization
    db.exec('ANALYZE');
    console.log('✓ Database analyzed');
    
    // Incremental vacuum to reclaim space
    db.exec('PRAGMA incremental_vacuum');
    console.log('✓ Incremental vacuum completed');
    
    // Optimize database
    db.exec('PRAGMA optimize');
    console.log('✓ Database optimized');
    
    // Check integrity
    const integrityCheck = db.pragma('integrity_check');
    if (Array.isArray(integrityCheck) && integrityCheck[0]?.integrity_check === 'ok') {
      console.log('✓ Database integrity check passed');
    } else {
      console.error('⚠ Database integrity issues detected:', integrityCheck);
    }
    
    console.log('Database maintenance completed');
  } catch (error) {
    console.error('❌ Database maintenance failed:', error);
    throw error;
  }
}

/**
 * Get database statistics using the singleton
 */
export function getDatabaseStatistics(): any {
  try {
    const db = DatabaseManager.getConnection();
    
    return {
      pageCount: db.pragma('page_count')[0],
      pageSize: db.pragma('page_size')[0],
      cacheSize: db.pragma('cache_size')[0],
      journalMode: db.pragma('journal_mode')[0],
      walCheckpoint: db.pragma('wal_checkpoint(PASSIVE)')[0],
      stats: db.pragma('stats'),
      compiledOptions: db.pragma('compile_options')
    };
  } catch (error) {
    console.error('❌ Failed to get database statistics:', error);
    return { error: error.message };
  }
}

/**
 * Create a checkpoint (for WAL mode)
 */
export function createCheckpoint(mode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE' = 'PASSIVE'): void {
  try {
    const db = DatabaseManager.getConnection();
    const result = db.pragma(`wal_checkpoint(${mode})`);
    console.log(`Checkpoint (${mode}) completed:`, result);
  } catch (error) {
    console.error(`❌ Checkpoint (${mode}) failed:`, error);
    throw error;
  }
}

/**
 * Execute multiple statements in a transaction using the singleton
 */
export function batchExecute(statements: string[]): void {
  try {
    const db = DatabaseManager.getConnection();
    
    const batch = db.transaction(() => {
      for (const stmt of statements) {
        db.exec(stmt);
      }
    });
    
    batch();
  } catch (error) {
    console.error('❌ Batch execution failed:', error);
    throw error;
  }
}

/**
 * Execute a function within a transaction using the singleton
 */
export function executeTransaction<T>(fn: () => T): T {
  try {
    const db = DatabaseManager.getConnection();
    const trx = db.transaction(fn);
    return trx.immediate(); // Use immediate mode to prevent deadlocks
  } catch (error) {
    console.error('❌ Transaction execution failed:', error);
    throw error;
  }
}

/**
 * Get the singleton database instance
 * @deprecated Use DatabaseManager.getConnection() directly
 */
export function getDatabaseInstance() {
  return DatabaseManager.getConnection();
}

/**
 * Re-export the DatabaseManager singleton for convenience
 */
export { default as DatabaseManager } from '../../database/DatabaseManager';

/**
 * Legacy compatibility - export database manager reference
 * @deprecated Use DatabaseManager singleton directly
 */
export const dbManager = {
  getDatabase: () => DatabaseManager.getConnection(),
  getStatistics: getDatabaseStatistics,
  performMaintenance: performDatabaseMaintenance,
  checkpoint: createCheckpoint,
  batchExecute: batchExecute,
  transaction: executeTransaction,
  close: () => DatabaseManager.close()
};