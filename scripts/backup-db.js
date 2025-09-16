#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || './persian_legal_ai.db';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

async function backupDatabase() {
  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Check if database file exists
    if (!fs.existsSync(DB_PATH)) {
      console.log('⚠️  No database file found, skipping backup');
      return;
    }

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `database-backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);

    console.log(`✅ Database backup created: ${backupPath}`);
    console.log(`📊 Backup size: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Database backup failed:', error.message);
    process.exit(1);
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase();
}

export default backupDatabase;