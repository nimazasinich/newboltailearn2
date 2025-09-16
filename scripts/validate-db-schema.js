#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * Validates critical database schema before deployment
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = process.env.DATABASE_URL || process.env.DB_PATH || './database.sqlite';
const REQUIRED_TABLES = [
  'users',
  'models', 
  'training_sessions',
  'datasets',
  'analytics'
];

const REQUIRED_COLUMNS = {
  training_sessions: [
    'id',
    'model_id',
    'dataset_id',
    'parameters',
    'status',
    'created_at'
  ],
  models: [
    'id',
    'name',
    'type',
    'status',
    'created_at'
  ],
  users: [
    'id',
    'username',
    'email',
    'password_hash',
    'created_at'
  ]
};

class DatabaseValidator {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.errors = [];
    this.warnings = [];
  }

  connect() {
    try {
      console.log(`🔗 Connecting to database: ${this.dbPath}`);
      
      // Check if database file exists
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database file not found: ${this.dbPath}`);
      }

      this.db = new Database(this.dbPath, { readonly: true });
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      this.errors.push(`Database connection failed: ${error.message}`);
      console.error(`❌ ${error.message}`);
      return false;
    }
  }

  validateTables() {
    console.log('\n📋 Validating required tables...');
    
    try {
      const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      const tableNames = tables.map(t => t.name);
      console.log(`Found tables: ${tableNames.join(', ')}`);

      for (const requiredTable of REQUIRED_TABLES) {
        if (!tableNames.includes(requiredTable)) {
          this.errors.push(`Missing required table: ${requiredTable}`);
          console.error(`❌ Missing table: ${requiredTable}`);
        } else {
          console.log(`✅ Table exists: ${requiredTable}`);
        }
      }

      return this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Table validation failed: ${error.message}`);
      return false;
    }
  }

  validateColumns() {
    console.log('\n🏗️ Validating table columns...');

    try {
      for (const [tableName, requiredColumns] of Object.entries(REQUIRED_COLUMNS)) {
        console.log(`\nChecking columns for table: ${tableName}`);
        
        try {
          const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
          const columnNames = columns.map(col => col.name);
          
          console.log(`  Found columns: ${columnNames.join(', ')}`);

          for (const requiredColumn of requiredColumns) {
            if (!columnNames.includes(requiredColumn)) {
              this.errors.push(`Missing column '${requiredColumn}' in table '${tableName}'`);
              console.error(`  ❌ Missing column: ${requiredColumn}`);
            } else {
              console.log(`  ✅ Column exists: ${requiredColumn}`);
            }
          }
        } catch (error) {
          this.errors.push(`Failed to check columns for table '${tableName}': ${error.message}`);
          console.error(`  ❌ Error checking table: ${error.message}`);
        }
      }

      return this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Column validation failed: ${error.message}`);
      return false;
    }
  }

  validateDataIntegrity() {
    console.log('\n🔍 Running basic data integrity checks...');

    try {
      // Check for orphaned records
      const checks = [
        {
          name: 'training_sessions without valid model_id',
          query: `
            SELECT COUNT(*) as count 
            FROM training_sessions ts 
            LEFT JOIN models m ON ts.model_id = m.id 
            WHERE m.id IS NULL
          `
        },
        {
          name: 'models with invalid status',
          query: `
            SELECT COUNT(*) as count 
            FROM models 
            WHERE status NOT IN ('idle', 'training', 'completed', 'error', 'stopped')
          `
        }
      ];

      for (const check of checks) {
        try {
          const result = this.db.prepare(check.query).get();
          if (result.count > 0) {
            this.warnings.push(`Data integrity issue: ${check.name} (${result.count} records)`);
            console.warn(`⚠️  ${check.name}: ${result.count} records`);
          } else {
            console.log(`✅ ${check.name}: OK`);
          }
        } catch (error) {
          this.warnings.push(`Could not run integrity check '${check.name}': ${error.message}`);
          console.warn(`⚠️  Could not check: ${check.name}`);
        }
      }

      return true;
    } catch (error) {
      this.warnings.push(`Data integrity validation failed: ${error.message}`);
      return true; // Non-critical, don't fail deployment
    }
  }

  validateIndexes() {
    console.log('\n📊 Checking database indexes...');

    try {
      const indexes = this.db.prepare(`
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `).all();

      console.log(`Found ${indexes.length} custom indexes`);
      
      // Check for recommended indexes
      const recommendedIndexes = [
        { table: 'training_sessions', column: 'model_id' },
        { table: 'training_sessions', column: 'status' },
        { table: 'models', column: 'status' }
      ];

      for (const rec of recommendedIndexes) {
        const hasIndex = indexes.some(idx => 
          idx.tbl_name === rec.table && 
          idx.sql && idx.sql.includes(rec.column)
        );
        
        if (!hasIndex) {
          this.warnings.push(`Missing recommended index on ${rec.table}.${rec.column}`);
          console.warn(`⚠️  Missing index: ${rec.table}.${rec.column}`);
        } else {
          console.log(`✅ Index exists: ${rec.table}.${rec.column}`);
        }
      }

      return true;
    } catch (error) {
      this.warnings.push(`Index validation failed: ${error.message}`);
      return true; // Non-critical
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('🔒 Database connection closed');
    }
  }

  validate() {
    console.log('🚀 Starting database schema validation...\n');

    if (!this.connect()) {
      return false;
    }

    const results = {
      tables: this.validateTables(),
      columns: this.validateColumns(),
      integrity: this.validateDataIntegrity(),
      indexes: this.validateIndexes()
    };

    this.close();

    // Generate report
    console.log('\n📋 VALIDATION REPORT');
    console.log('===================');
    
    if (this.errors.length === 0) {
      console.log('✅ All critical validations passed');
    } else {
      console.log(`❌ ${this.errors.length} critical error(s) found:`);
      this.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    const success = this.errors.length === 0;
    console.log(`\n${success ? '✅' : '❌'} Database validation: ${success ? 'PASSED' : 'FAILED'}`);
    
    return success;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DatabaseValidator(DB_PATH);
  const success = validator.validate();
  process.exit(success ? 0 : 1);
}

export default DatabaseValidator;