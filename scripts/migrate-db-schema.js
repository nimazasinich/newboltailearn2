#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds missing columns and fixes schema issues for deployment
 */

import Database from 'better-sqlite3';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_URL || process.env.DB_PATH || './database.sqlite';

class DatabaseMigrator {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  connect() {
    try {
      console.log(`🔗 Connecting to database: ${this.dbPath}`);
      
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database file not found: ${this.dbPath}`);
      }

      this.db = new Database(this.dbPath);
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed: ${error.message}`);
      return false;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('🔒 Database connection closed');
    }
  }

  checkColumnExists(tableName, columnName) {
    try {
      const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
      return columns.some(col => col.name === columnName);
    } catch (error) {
      console.error(`Error checking column ${tableName}.${columnName}: ${error.message}`);
      return false;
    }
  }

  addMissingColumns() {
    console.log('\n🔧 Adding missing columns...');

    const migrations = [
      {
        table: 'training_sessions',
        column: 'dataset_id',
        definition: 'TEXT',
        defaultValue: "'default-dataset'"
      },
      {
        table: 'training_sessions',
        column: 'parameters',
        definition: 'TEXT',
        defaultValue: "'{}'"
      },
      {
        table: 'training_sessions',
        column: 'created_at',
        definition: 'DATETIME',
        defaultValue: 'CURRENT_TIMESTAMP'
      }
    ];

    let migrationsApplied = 0;

    for (const migration of migrations) {
      try {
        if (!this.checkColumnExists(migration.table, migration.column)) {
          console.log(`Adding column ${migration.table}.${migration.column}...`);
          
          const sql = `ALTER TABLE ${migration.table} ADD COLUMN ${migration.column} ${migration.definition} DEFAULT ${migration.defaultValue}`;
          this.db.exec(sql);
          
          console.log(`✅ Added column: ${migration.table}.${migration.column}`);
          migrationsApplied++;
        } else {
          console.log(`⏭️  Column already exists: ${migration.table}.${migration.column}`);
        }
      } catch (error) {
        console.error(`❌ Failed to add column ${migration.table}.${migration.column}: ${error.message}`);
        return false;
      }
    }

    console.log(`\n🎉 Applied ${migrationsApplied} migrations`);
    return true;
  }

  updateExistingData() {
    console.log('\n📝 Updating existing data...');

    try {
      // Update any existing training_sessions that might have NULL values
      const updates = [
        {
          description: 'Set default dataset_id for existing sessions',
          sql: `UPDATE training_sessions SET dataset_id = 'default-dataset' WHERE dataset_id IS NULL`
        },
        {
          description: 'Set default parameters for existing sessions', 
          sql: `UPDATE training_sessions SET parameters = '{}' WHERE parameters IS NULL`
        },
        {
          description: 'Set created_at for existing sessions',
          sql: `UPDATE training_sessions SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`
        }
      ];

      for (const update of updates) {
        console.log(`Executing: ${update.description}`);
        const result = this.db.prepare(update.sql).run();
        console.log(`✅ Updated ${result.changes} records`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to update existing data: ${error.message}`);
      return false;
    }
  }

  createIndexes() {
    console.log('\n📊 Creating recommended indexes...');

    const indexes = [
      {
        name: 'idx_training_sessions_dataset_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_sessions_dataset_id ON training_sessions(dataset_id)'
      },
      {
        name: 'idx_training_sessions_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON training_sessions(created_at)'
      }
    ];

    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.name}`);
        this.db.exec(index.sql);
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        console.error(`⚠️  Could not create index ${index.name}: ${error.message}`);
      }
    }

    return true;
  }

  migrate() {
    console.log('🚀 Starting database migration...\n');

    if (!this.connect()) {
      return false;
    }

    try {
      // Start transaction
      this.db.exec('BEGIN TRANSACTION');

      const success = this.addMissingColumns() && 
                     this.updateExistingData() && 
                     this.createIndexes();

      if (success) {
        this.db.exec('COMMIT');
        console.log('\n✅ Migration completed successfully');
      } else {
        this.db.exec('ROLLBACK');
        console.log('\n❌ Migration failed - changes rolled back');
      }

      return success;
    } catch (error) {
      try {
        this.db.exec('ROLLBACK');
      } catch (rollbackError) {
        console.error(`Failed to rollback: ${rollbackError.message}`);
      }
      console.error(`❌ Migration failed: ${error.message}`);
      return false;
    } finally {
      this.close();
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new DatabaseMigrator(DB_PATH);
  const success = migrator.migrate();
  process.exit(success ? 0 : 1);
}

export default DatabaseMigrator;