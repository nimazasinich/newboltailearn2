#!/usr/bin/env node

/**
 * Persian Legal AI Database Audit Script
 * --------------------------------------
 * Runs a comprehensive, non-destructive verification of the database layer.
 * All actions are performed against an isolated test database created inside
 * the audit artifacts directory (audit/db/<timestamp>). Production databases
 * are never modified.
 */

import { execSync } from 'child_process';
import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseManager from '../server/database/DatabaseManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function createArtifactsDir() {
  const dir = path.join(repoRoot, 'audit', 'db', timestamp());
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeArtifact(dir, filename, content) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function safeExec(command) {
  try {
    const stdout = execSync(command, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    }).toString();
    return { success: true, stdout };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : '',
      error
    };
  }
}

function summarizeError(error) {
  return error?.message || (typeof error === 'string' ? error : 'Unknown error');
}

async function initializeTestDatabase(testDbPath, artifactsDir) {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = testDbPath;
  process.env.DATABASE_URL = testDbPath;

  let schemaApplied = false;
  let seedApplied = false;

  try {
    await DatabaseManager.initialize();
    const connection = DatabaseManager.getConnection();
    schemaApplied = true;

    const seedPath = path.join(repoRoot, 'server', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      connection.exec('BEGIN TRANSACTION;');
      connection.exec(seedSql);
      connection.exec('COMMIT;');
      seedApplied = true;
    }
    return { schemaApplied, seedApplied };
  } catch (error) {
    writeArtifact(
      artifactsDir,
      'initialization-error.log',
      `Database initialization failed: ${summarizeError(error)}\n${error?.stack || ''}`
    );
    return { schemaApplied, seedApplied, error };
  } finally {
    DatabaseManager.close();
  }
}

function captureEnvironment(artifactsDir) {
  const envReport = [];
  envReport.push('=== PERSIAN LEGAL AI DATABASE AUDIT ENVIRONMENT ===');
  envReport.push(`Timestamp: ${new Date().toISOString()}`);
  envReport.push(`Repository Root: ${repoRoot}`);
  envReport.push(`Node.js Version: ${process.version}`);

  const npmVersion = safeExec('npm -v');
  envReport.push(`NPM Version: ${npmVersion.success ? npmVersion.stdout.trim() : 'Unavailable'}`);

  try {
    envReport.push(`Operating System: ${os.type()} ${os.release()} (${os.platform()})`);
  } catch (error) {
    envReport.push(`Operating System: Unknown (${summarizeError(error)})`);
  }

  const localeInfo = safeExec('locale');
  envReport.push('--- Locale Information ---');
  envReport.push(localeInfo.success ? localeInfo.stdout.trim() : 'locale command not available');

  writeArtifact(artifactsDir, 'environment.txt', envReport.join('\n'));
}

function discoverDatabaseCode(artifactsDir) {
  const patterns = [
    'better-sqlite3',
    'CREATE TABLE',
    'legal_documents',
    'persian',
    'seed'
  ].join('|');

  const discovery = safeExec(`rg -n "${patterns}" server database src`);
  const output = discovery.success
    ? discovery.stdout
    : `ripgrep unavailable or failed.\n${discovery.stderr || ''}`;
  writeArtifact(artifactsDir, 'code-discovery.txt', output);
}

function prepareTestEnvFile(testEnvPath, testDbPath) {
  const candidates = ['.env.test', '.env.example', '.env.sample'];
  let source = null;
  for (const candidate of candidates) {
    const fullPath = path.join(repoRoot, candidate);
    if (fs.existsSync(fullPath)) {
      source = fullPath;
      break;
    }
  }

  if (source) {
    fs.copyFileSync(source, testEnvPath);
  } else {
    fs.writeFileSync(testEnvPath, '', 'utf8');
  }

  const envLines = fs.readFileSync(testEnvPath, 'utf8').split(/\r?\n/);
  const overrides = new Map([
    ['DATABASE_URL', `file:${testDbPath}`],
    ['DATABASE_PATH', testDbPath],
    ['DB_PATH', testDbPath],
    ['DEFAULT_ADMIN_PASSWORD', 'SecureTest!2024']
  ]);

  const updated = [];
  const seenKeys = new Set();

  for (const line of envLines) {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match) {
      updated.push(line);
      continue;
    }
    const key = match[1];
    if (overrides.has(key)) {
      updated.push(`${key}=${overrides.get(key)}`);
      seenKeys.add(key);
    } else {
      updated.push(line);
    }
  }

  for (const [key, value] of overrides) {
    if (!seenKeys.has(key)) {
      updated.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(testEnvPath, updated.join('\n'), 'utf8');
}

function analyzeSchema(db, artifactsDir) {
  const tables = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`
    )
    .all();
  const tableNames = tables.map((row) => row.name);

  const schemaDump = db
    .prepare(
      `SELECT sql FROM sqlite_master WHERE type IN ('table', 'index') AND sql IS NOT NULL ORDER BY name;`
    )
    .all()
    .map((row) => row.sql)
    .join('\n\n');

  writeArtifact(artifactsDir, 'tables.txt', tableNames.join('\n'));
  writeArtifact(artifactsDir, 'schema.sql', schemaDump);

  const pragmaReports = {
    foreignKeys: db.pragma('foreign_keys'),
    journalMode: db.pragma('journal_mode'),
    encoding: db.pragma('encoding'),
    integrityCheck: db.pragma('integrity_check')
  };

  writeArtifact(artifactsDir, 'pragmas.json', JSON.stringify(pragmaReports, null, 2));

  return { tables: tableNames, pragmas: pragmaReports };
}

function runSecurityChecks(db, artifactsDir) {
  const result = {
    adminUsers: 0,
    hashedPasswords: true,
    suspiciousPasswords: 0
  };

  try {
    const admins = db
      .prepare(`SELECT username, password_hash FROM users WHERE role='admin' OR username LIKE '%admin%'`)
      .all();
    result.adminUsers = admins.length;

    for (const admin of admins) {
      if (!admin.password_hash || admin.password_hash.length < 20 || !admin.password_hash.includes('$')) {
        result.hashedPasswords = false;
      }
      if (admin.password_hash === 'admin123') {
        result.suspiciousPasswords += 1;
      }
    }

    writeArtifact(artifactsDir, 'admin-users.json', JSON.stringify(admins, null, 2));
  } catch (error) {
    writeArtifact(
      artifactsDir,
      'security-check-error.log',
      `Failed to inspect users table: ${summarizeError(error)}`
    );
  }

  return result;
}

function runCrudExercises(db, artifactsDir) {
  const report = {
    logInsert: false,
    modelUpdate: false,
    rollbackVerified: false
  };

  try {
    const insertTransaction = db.transaction(() => {
      const stmt = db.prepare(
        'INSERT INTO system_logs (level, category, message, metadata) VALUES (?, ?, ?, ?)' 
      );
      const info = stmt.run('info', 'audit', 'Temporary audit entry', JSON.stringify({ origin: 'persian-db-audit' }));
      const inserted = db.prepare('SELECT message FROM system_logs WHERE id = ?').get(info.lastInsertRowid);
      db.prepare('DELETE FROM system_logs WHERE id = ?').run(info.lastInsertRowid);
      return inserted?.message === 'Temporary audit entry';
    });
    report.logInsert = insertTransaction();
  } catch (error) {
    writeArtifact(
      artifactsDir,
      'crud-log-error.log',
      `System log CRUD test failed: ${summarizeError(error)}`
    );
  }

  try {
    const model = db.prepare('SELECT id, status FROM models LIMIT 1').get();
    if (model) {
      const updateTransaction = db.transaction(() => {
        const original = model.status;
        db.prepare('UPDATE models SET status = ? WHERE id = ?').run('training', model.id);
        const updated = db.prepare('SELECT status FROM models WHERE id = ?').get(model.id)?.status;
        db.prepare('UPDATE models SET status = ? WHERE id = ?').run(original, model.id);
        return updated === 'training';
      });
      report.modelUpdate = updateTransaction();
    }
  } catch (error) {
    writeArtifact(
      artifactsDir,
      'crud-model-error.log',
      `Model update CRUD test failed: ${summarizeError(error)}`
    );
  }

  try {
    const rollbackTransaction = db.transaction(() => {
      db.prepare(
        'INSERT INTO analytics (event_type, event_data) VALUES (?, ?)' 
      ).run('audit-test', JSON.stringify({ temp: true }));
      throw new Error('INTENTIONAL_ROLLBACK');
    });
    rollbackTransaction();
  } catch (error) {
    if (error.message === 'INTENTIONAL_ROLLBACK') {
      const count = db
        .prepare("SELECT COUNT(*) as count FROM analytics WHERE event_type = 'audit-test'")
        .get().count;
      report.rollbackVerified = count === 0;
    } else {
      writeArtifact(
        artifactsDir,
        'crud-rollback-error.log',
        `Rollback validation failed: ${summarizeError(error)}`
      );
    }
  }

  writeArtifact(artifactsDir, 'crud-report.json', JSON.stringify(report, null, 2));
  return report;
}

function analyzePersianText(db, artifactsDir) {
  const report = {
    persianDatasetCount: 0,
    persianNames: []
  };

  try {
    const rows = db
      .prepare(
        "SELECT id, name FROM datasets WHERE name GLOB '*[آ-ی]*' OR description GLOB '*[آ-ی]*'"
      )
      .all();
    report.persianDatasetCount = rows.length;
    report.persianNames = rows.map((row) => row.name);
    writeArtifact(artifactsDir, 'persian-datasets.json', JSON.stringify(rows, null, 2));
  } catch (error) {
    writeArtifact(
      artifactsDir,
      'persian-text-error.log',
      `Failed to query Persian text: ${summarizeError(error)}`
    );
  }

  return report;
}

function createBackup(testDbPath, artifactsDir) {
  const backupPath = path.join(artifactsDir, 'persian_legal_test.backup.db');
  fs.copyFileSync(testDbPath, backupPath);

  const originalStats = fs.statSync(testDbPath);
  const backupStats = fs.statSync(backupPath);

  writeArtifact(
    artifactsDir,
    'backup-info.json',
    JSON.stringify(
      {
        testDbPath,
        backupPath,
        originalSize: originalStats.size,
        backupSize: backupStats.size
      },
      null,
      2
    )
  );

  return backupPath;
}

function runSummaryReport(metadata) {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      artifactsDir: metadata.artifactsDir,
      testDatabase: metadata.testDbPath
    },
    initialization: {
      schemaApplied: metadata.schemaApplied,
      seedApplied: metadata.seedApplied,
      initializationError: metadata.initializationError || null
    },
    schema: metadata.schema,
    security: metadata.security,
    crud: metadata.crud,
    persianText: metadata.persianText,
    backup: metadata.backupPath,
    notes: metadata.notes
  };
}

async function main() {
  console.log('🧠 Starting Persian Legal AI database audit...');

  const artifactsDir = createArtifactsDir();
  const testDbPath = path.join(artifactsDir, 'persian_legal_test.db');
  const testEnvPath = path.join(artifactsDir, '.env.test');

  captureEnvironment(artifactsDir);
  discoverDatabaseCode(artifactsDir);
  prepareTestEnvFile(testEnvPath, testDbPath);

  const initializationResult = await initializeTestDatabase(testDbPath, artifactsDir);
  const metadata = {
    artifactsDir,
    testDbPath,
    schemaApplied: initializationResult.schemaApplied,
    seedApplied: initializationResult.seedApplied,
    initializationError: initializationResult.error ? summarizeError(initializationResult.error) : null,
    notes: []
  };

  if (!initializationResult.schemaApplied) {
    metadata.notes.push('Schema could not be applied. See initialization-error.log for details.');
  }

  let db = null;
  try {
    db = new Database(testDbPath, { readonly: false });
    db.pragma('foreign_keys = ON');

    metadata.schema = analyzeSchema(db, artifactsDir);
    metadata.security = runSecurityChecks(db, artifactsDir);
    metadata.crud = runCrudExercises(db, artifactsDir);
    metadata.persianText = analyzePersianText(db, artifactsDir);

    const backupPath = createBackup(testDbPath, artifactsDir);
    metadata.backupPath = backupPath;

    const summary = runSummaryReport(metadata);
    writeArtifact(artifactsDir, 'audit-summary.json', JSON.stringify(summary, null, 2));

    const humanSummary = [
      '================================================================',
      'PERSIAN LEGAL AI DATABASE AUDIT SUMMARY',
      '================================================================',
      `Artifacts Directory: ${artifactsDir}`,
      `Test Database: ${testDbPath}`,
      '',
      `Schema Applied: ${summary.initialization.schemaApplied ? 'YES' : 'NO'}`,
      `Seed Data Applied: ${summary.initialization.seedApplied ? 'YES' : 'NO'}`,
      `Tables (${metadata.schema.tables.length}): ${metadata.schema.tables.join(', ')}`,
      '',
      'Security Checks:',
      `  Admin Users Found: ${metadata.security.adminUsers}`,
      `  Password Hashes Valid: ${metadata.security.hashedPasswords ? 'YES' : 'NO'}`,
      `  Suspicious Passwords: ${metadata.security.suspiciousPasswords}`,
      '',
      'CRUD Tests:',
      `  System Log Insert/Delete: ${metadata.crud.logInsert ? 'PASS' : 'FAIL'}`,
      `  Model Status Update/Rollback: ${metadata.crud.modelUpdate ? 'PASS' : 'SKIPPED'}`,
      `  Transaction Rollback: ${metadata.crud.rollbackVerified ? 'PASS' : 'FAIL'}`,
      '',
      'Persian Text Support:',
      `  Persian Datasets: ${metadata.persianText.persianDatasetCount}`,
      `  Example Names: ${metadata.persianText.persianNames.join(', ') || 'None detected'}`,
      '',
      `Backup Created At: ${metadata.backupPath}`,
      '',
      ...(metadata.notes.length ? ['Notes:', ...metadata.notes.map((note) => `  - ${note}`)] : []),
      '================================================================'
    ].join('\n');

    writeArtifact(artifactsDir, 'AUDIT-SUMMARY.txt', humanSummary);
    console.log('✅ Audit completed. See audit summary for details.');
    console.log(`📁 Artifacts directory: ${artifactsDir}`);
  } catch (error) {
    metadata.notes.push(`Audit failed: ${summarizeError(error)}`);
    writeArtifact(
      artifactsDir,
      'fatal-error.log',
      `Audit failed: ${summarizeError(error)}\n${error?.stack || ''}`
    );
    console.error('❌ Audit failed. See artifacts for details.');
  } finally {
    if (db) {
      db.close();
    }
  }
}

main();
