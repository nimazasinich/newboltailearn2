#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../persian_legal_ai.db');
const SEED_FILE = path.join(__dirname, 'seed.sql');

console.log('🌱 Starting database seeding...');
console.log(`Database path: ${DB_PATH}`);

// Ensure database exists
if (!fs.existsSync(DB_PATH)) {
  console.log('❌ Database file not found. Please run the server first to create the database.');
  process.exit(1);
}

// Read seed SQL
const seedSQL = fs.readFileSync(SEED_FILE, 'utf8');

const db = new (sqlite3.verbose()).Database(DB_PATH);

console.log('🔄 Executing seed script...');

db.exec(seedSQL, (err) => {
  if (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }

  console.log('🎉 Database seeded successfully!');
  
  // Verify seeded data
  db.all('SELECT COUNT(*) as count FROM models', (err, rows) => {
    if (err) {
      console.error('❌ Error verifying models:', err);
    } else {
      console.log(`✅ Models: ${rows[0].count} records`);
    }

    db.all('SELECT COUNT(*) as count FROM datasets', (err, rows) => {
      if (err) {
        console.error('❌ Error verifying datasets:', err);
      } else {
        console.log(`✅ Datasets: ${rows[0].count} records`);
      }

      db.all('SELECT COUNT(*) as count FROM metrics_history', (err, rows) => {
        if (err) {
          console.error('❌ Error verifying metrics_history:', err);
        } else {
          console.log(`✅ Metrics history: ${rows[0].count} records`);
        }

        db.close();
        console.log('🏁 Seeding complete!');
      });
    });
  });
});