#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../persian_legal_ai.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

console.log('🔄 Starting database migration...');
console.log(`Database path: ${DB_PATH}`);

// Ensure database exists
if (!fs.existsSync(DB_PATH)) {
  console.log('❌ Database file not found. Please run the server first to create the database.');
  process.exit(1);
}

const db = new (sqlite3.verbose()).Database(DB_PATH);

// Create migrations table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of applied migrations
  db.all('SELECT filename FROM migrations', (err, rows) => {
    if (err) {
      console.error('❌ Error reading migrations table:', err);
      process.exit(1);
    }

    const appliedMigrations = rows.map(row => row.filename);
    console.log(`✅ Found ${appliedMigrations.length} applied migrations`);

    // Get all migration files
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('📁 No migrations directory found, creating...');
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
      console.log('✅ Migrations directory created');
      db.close();
      return;
    }

    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Apply pending migrations
    const pendingMigrations = migrationFiles.filter(file => !appliedMigrations.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      db.close();
      return;
    }

    console.log(`🔄 Applying ${pendingMigrations.length} pending migrations...`);

    let completed = 0;
    
    pendingMigrations.forEach((filename, index) => {
      const filePath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`🔄 Applying migration: ${filename}`);

      db.exec(sql, (err) => {
        if (err) {
          console.error(`❌ Error applying migration ${filename}:`, err);
          process.exit(1);
        }

        // Record migration as applied
        db.run('INSERT INTO migrations (filename) VALUES (?)', [filename], (err) => {
          if (err) {
            console.error(`❌ Error recording migration ${filename}:`, err);
            process.exit(1);
          }

          console.log(`✅ Applied migration: ${filename}`);
          completed++;

          if (completed === pendingMigrations.length) {
            console.log('🎉 All migrations applied successfully!');
            db.close();
          }
        });
      });
    });
  });
});