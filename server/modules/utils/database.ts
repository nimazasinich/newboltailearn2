import Database from 'better-sqlite3';
import { config } from '../security/config.js';

/**
 * Database optimization and management utilities
 */
export class DatabaseManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.optimize();
  }

  /**
   * Apply SQLite optimizations for performance
   */
  private optimize(): void {
    // Enable Write-Ahead Logging for better concurrency
    this.db.pragma('journal_mode = WAL');
    
    // Increase cache size (negative value = KB, positive = pages)
    this.db.pragma('cache_size = -64000'); // 64MB cache
    
    // Enable memory mapping for faster reads
    this.db.pragma('mmap_size = 30000000000'); // 30GB mmap
    
    // Synchronous mode - NORMAL is safe and faster than FULL
    this.db.pragma('synchronous = NORMAL');
    
    // Enable foreign key constraints
    this.db.pragma('foreign_keys = ON');
    
    // Optimize for faster writes
    this.db.pragma('temp_store = MEMORY');
    
    // Auto vacuum to reclaim space
    this.db.pragma('auto_vacuum = INCREMENTAL');
    
    // Increase page size for better performance with larger data
    // Note: This only works on new databases
    if (this.isDatabaseNew()) {
      this.db.pragma('page_size = 8192');
    }
    
    console.log('✅ Database optimizations applied');
  }

  /**
   * Check if database is new (no tables)
   */
  private isDatabaseNew(): boolean {
    const tables = this.db.prepare(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'"
    ).get() as { count: number };
    
    return tables.count === 0;
  }

  /**
   * Perform database maintenance
   */
  async performMaintenance(): Promise<void> {
    console.log('Starting database maintenance...');
    
    // Analyze tables for query optimization
    this.db.exec('ANALYZE');
    console.log('✓ Database analyzed');
    
    // Incremental vacuum to reclaim space
    this.db.exec('PRAGMA incremental_vacuum');
    console.log('✓ Incremental vacuum completed');
    
    // Optimize database
    this.db.exec('PRAGMA optimize');
    console.log('✓ Database optimized');
    
    // Check integrity
    const integrityCheck = this.db.pragma('integrity_check');
    if (integrityCheck[0].integrity_check === 'ok') {
      console.log('✓ Database integrity check passed');
    } else {
      console.error('⚠ Database integrity issues detected:', integrityCheck);
    }
    
    console.log('Database maintenance completed');
  }

  /**
   * Get database statistics
   */
  getStatistics(): any {
    return {
      pageCount: this.db.pragma('page_count')[0],
      pageSize: this.db.pragma('page_size')[0],
      cacheSize: this.db.pragma('cache_size')[0],
      journalMode: this.db.pragma('journal_mode')[0],
      walCheckpoint: this.db.pragma('wal_checkpoint(PASSIVE)')[0],
      stats: this.db.pragma('stats'),
      compiledOptions: this.db.pragma('compile_options')
    };
  }

  /**
   * Create a checkpoint (for WAL mode)
   */
  checkpoint(mode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE' = 'PASSIVE'): void {
    const result = this.db.pragma(`wal_checkpoint(${mode})`);
    console.log(`Checkpoint (${mode}) completed:`, result);
  }

  /**
   * Begin transaction with proper isolation
   */
  transaction<T>(fn: () => T): T {
    const trx = this.db.transaction(fn);
    return trx.immediate(); // Use immediate mode to prevent deadlocks
  }

  /**
   * Prepare statement with caching
   */
  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  /**
   * Execute multiple statements in a transaction
   */
  batchExecute(statements: string[]): void {
    const batch = this.db.transaction(() => {
      for (const stmt of statements) {
        this.db.exec(stmt);
      }
    });
    batch();
  }

  /**
   * Close database connection properly
   */
  close(): void {
    // Checkpoint before closing
    this.checkpoint('TRUNCATE');
    
    // Close the database
    this.db.close();
    
    console.log('Database connection closed');
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }
}

/**
 * Database connection pool for better concurrency
 */
export class DatabasePool {
  private connections: Database.Database[] = [];
  private available: Database.Database[] = [];
  private dbPath: string;
  private maxConnections: number;

  constructor(dbPath: string, maxConnections: number = 5) {
    this.dbPath = dbPath;
    this.maxConnections = maxConnections;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.maxConnections; i++) {
      const db = new Database(this.dbPath);
      
      // Apply optimizations to each connection
      db.pragma('journal_mode = WAL');
      db.pragma('cache_size = -16000'); // 16MB per connection
      db.pragma('synchronous = NORMAL');
      db.pragma('foreign_keys = ON');
      
      this.connections.push(db);
      this.available.push(db);
    }
    
    console.log(`Database pool initialized with ${this.maxConnections} connections`);
  }

  /**
   * Get a connection from the pool
   */
  async acquire(): Promise<Database.Database> {
    // Wait if no connections available
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const db = this.available.pop()!;
    return db;
  }

  /**
   * Return a connection to the pool
   */
  release(db: Database.Database): void {
    if (!this.available.includes(db) && this.connections.includes(db)) {
      this.available.push(db);
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async execute<T>(fn: (db: Database.Database) => T): Promise<T> {
    const db = await this.acquire();
    try {
      return fn(db);
    } finally {
      this.release(db);
    }
  }

  /**
   * Close all connections in the pool
   */
  closeAll(): void {
    for (const db of this.connections) {
      db.close();
    }
    this.connections = [];
    this.available = [];
    console.log('All database connections closed');
  }
}

/**
 * Create and export database manager instance
 */
export const dbManager = new DatabaseManager(config.DATABASE_PATH || './persian_legal_ai.db');