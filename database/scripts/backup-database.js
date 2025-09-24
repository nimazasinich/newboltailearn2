#!/usr/bin/env node

// Persian Legal AI Database Backup Script
// Comprehensive backup and recovery procedures

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DatabaseBackup {
    constructor(dbPath, backupDir = './database/backups') {
        this.dbPath = dbPath;
        this.backupDir = backupDir;
        this.db = null;
    }

    async connect() {
        try {
            this.db = new Database(this.dbPath);
            console.log('✅ Database connected for backup');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async createBackup(backupType = 'full') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `persian_legal_ai_${backupType}_${timestamp}.db`;
        const backupPath = path.join(this.backupDir, backupFileName);

        try {
            // Ensure backup directory exists
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
            }

            console.log(`🔄 Creating ${backupType} backup...`);
            console.log(`📁 Source: ${this.dbPath}`);
            console.log(`📁 Destination: ${backupPath}`);

            if (backupType === 'full') {
                // Full backup using SQLite backup API
                const backupDb = new Database(backupPath);
                this.db.backup(backupDb);
                backupDb.close();
            } else if (backupType === 'schema') {
                // Schema-only backup
                await this.createSchemaBackup(backupPath);
            } else if (backupType === 'data') {
                // Data-only backup
                await this.createDataBackup(backupPath);
            }

            // Verify backup
            const backupSize = fs.statSync(backupPath).size;
            console.log(`✅ Backup created successfully`);
            console.log(`📊 Backup size: ${(backupSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`📁 Backup file: ${backupPath}`);

            // Create backup metadata
            await this.createBackupMetadata(backupPath, backupType, backupSize);

            return backupPath;
        } catch (error) {
            console.error('❌ Backup failed:', error.message);
            throw error;
        }
    }

    async createSchemaBackup(backupPath) {
        const schemaDb = new Database(backupPath);
        
        // Get schema from original database
        const tables = this.db.prepare(`
            SELECT name, sql FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        for (const table of tables) {
            schemaDb.exec(table.sql);
        }

        // Get indexes
        const indexes = this.db.prepare(`
            SELECT name, sql FROM sqlite_master 
            WHERE type='index' AND name NOT LIKE 'sqlite_%'
        `).all();

        for (const index of indexes) {
            if (index.sql) {
                schemaDb.exec(index.sql);
            }
        }

        // Get triggers
        const triggers = this.db.prepare(`
            SELECT name, sql FROM sqlite_master 
            WHERE type='trigger'
        `).all();

        for (const trigger of triggers) {
            if (trigger.sql) {
                schemaDb.exec(trigger.sql);
            }
        }

        schemaDb.close();
    }

    async createDataBackup(backupPath) {
        const dataDb = new Database(backupPath);
        
        // Create tables first
        await this.createSchemaBackup(backupPath);
        
        // Copy data
        const tables = this.db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        for (const table of tables) {
            const data = this.db.prepare(`SELECT * FROM ${table.name}`).all();
            
            if (data.length > 0) {
                const columns = Object.keys(data[0]);
                const placeholders = columns.map(() => '?').join(', ');
                const insertSql = `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${placeholders})`;
                const insertStmt = dataDb.prepare(insertSql);
                
                for (const row of data) {
                    insertStmt.run(...columns.map(col => row[col]));
                }
            }
        }

        dataDb.close();
    }

    async createBackupMetadata(backupPath, backupType, backupSize) {
        const metadata = {
            timestamp: new Date().toISOString(),
            backupType,
            sourcePath: this.dbPath,
            backupPath,
            backupSize,
            version: '1.0.0',
            tables: await this.getTableInfo(),
            indexes: await this.getIndexInfo(),
            triggers: await this.getTriggerInfo()
        };

        const metadataPath = backupPath.replace('.db', '_metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`📋 Backup metadata saved: ${metadataPath}`);
    }

    async getTableInfo() {
        const tables = this.db.prepare(`
            SELECT name, 
                   (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name = t.name) as exists
            FROM sqlite_master t
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all();

        const tableInfo = {};
        for (const table of tables) {
            const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
            tableInfo[table.name] = { rowCount: count };
        }

        return tableInfo;
    }

    async getIndexInfo() {
        const indexes = this.db.prepare(`
            SELECT name, tbl_name, sql FROM sqlite_master 
            WHERE type='index' AND name NOT LIKE 'sqlite_%'
        `).all();

        return indexes.map(idx => ({
            name: idx.name,
            table: idx.tbl_name,
            sql: idx.sql
        }));
    }

    async getTriggerInfo() {
        const triggers = this.db.prepare(`
            SELECT name, tbl_name, sql FROM sqlite_master 
            WHERE type='trigger'
        `).all();

        return triggers.map(trigger => ({
            name: trigger.name,
            table: trigger.tbl_name,
            sql: trigger.sql
        }));
    }

    async restoreBackup(backupPath) {
        try {
            console.log(`🔄 Restoring database from backup...`);
            console.log(`📁 Backup: ${backupPath}`);
            console.log(`📁 Target: ${this.dbPath}`);

            // Create backup of current database
            const currentBackup = await this.createBackup('pre_restore');
            console.log(`💾 Current database backed up to: ${currentBackup}`);

            // Close current connection
            this.db.close();

            // Copy backup to target location
            fs.copyFileSync(backupPath, this.dbPath);

            // Reconnect to restored database
            this.db = new Database(this.dbPath);

            // Verify restoration
            const tableCount = this.db.prepare(`
                SELECT COUNT(*) as count FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `).get().count;

            console.log(`✅ Database restored successfully`);
            console.log(`📊 Tables restored: ${tableCount}`);

            return true;
        } catch (error) {
            console.error('❌ Restore failed:', error.message);
            throw error;
        }
    }

    async listBackups() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                console.log('📁 No backup directory found');
                return [];
            }

            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.endsWith('.db'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.modified - a.modified);

            console.log('📋 Available Backups:');
            console.log('====================');
            files.forEach((backup, index) => {
                console.log(`${index + 1}. ${backup.name}`);
                console.log(`   Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
                console.log(`   Created: ${backup.created.toISOString()}`);
                console.log('');
            });

            return files;
        } catch (error) {
            console.error('❌ Error listing backups:', error.message);
            return [];
        }
    }

    async cleanupOldBackups(keepCount = 10) {
        try {
            const backups = await this.listBackups();
            
            if (backups.length <= keepCount) {
                console.log(`📁 No cleanup needed. Found ${backups.length} backups (keeping ${keepCount})`);
                return;
            }

            const toDelete = backups.slice(keepCount);
            console.log(`🗑️  Cleaning up ${toDelete.length} old backups...`);

            for (const backup of toDelete) {
                fs.unlinkSync(backup.path);
                console.log(`🗑️  Deleted: ${backup.name}`);
            }

            console.log(`✅ Cleanup completed. Kept ${keepCount} most recent backups`);
        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
        }
    }

    async verifyBackup(backupPath) {
        try {
            console.log(`🔍 Verifying backup: ${backupPath}`);
            
            const backupDb = new Database(backupPath);
            
            // Check tables
            const tables = backupDb.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `).all();

            console.log(`📊 Tables found: ${tables.length}`);
            
            // Check data integrity
            for (const table of tables) {
                const count = backupDb.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
                console.log(`   ${table.name}: ${count} rows`);
            }

            backupDb.close();
            console.log(`✅ Backup verification completed`);
            return true;
        } catch (error) {
            console.error('❌ Backup verification failed:', error.message);
            return false;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// CLI interface
async function main() {
    const command = process.argv[2];
    const dbPath = process.argv[3] || './data/persian_legal_ai.db';
    const backupDir = process.argv[4] || './database/backups';

    const backup = new DatabaseBackup(dbPath, backupDir);

    if (!await backup.connect()) {
        process.exit(1);
    }

    try {
        switch (command) {
            case 'backup': {
                const backupType = process.argv[4] || 'full';
                await backup.createBackup(backupType);
                break;
            }
            case 'restore': {
                const restorePath = process.argv[4];
                if (!restorePath) {
                    console.error('❌ Please provide backup path for restore');
                    process.exit(1);
                }
                await backup.restoreBackup(restorePath);
                break;
            }
            case 'list': {
                await backup.listBackups();
                break;
            }
            case 'cleanup': {
                const keepCount = parseInt(process.argv[4]) || 10;
                await backup.cleanupOldBackups(keepCount);
                break;
            }
            case 'verify': {
                const verifyPath = process.argv[4];
                if (!verifyPath) {
                    console.error('❌ Please provide backup path for verification');
                    process.exit(1);
                }
                await backup.verifyBackup(verifyPath);
                break;
            }
            default:
                console.log('📋 Persian Legal AI Database Backup Tool');
                console.log('========================================');
                console.log('Usage:');
                console.log('  node backup-database.js backup [db_path] [backup_type]');
                console.log('  node backup-database.js restore [db_path] [backup_path]');
                console.log('  node backup-database.js list [db_path]');
                console.log('  node backup-database.js cleanup [db_path] [keep_count]');
                console.log('  node backup-database.js verify [db_path] [backup_path]');
                console.log('');
                console.log('Examples:');
                console.log('  node backup-database.js backup');
                console.log('  node backup-database.js backup ./data/db.db schema');
                console.log('  node backup-database.js restore ./data/db.db ./backups/backup.db');
                console.log('  node backup-database.js list');
                console.log('  node backup-database.js cleanup');
                console.log('  node backup-database.js verify ./backups/backup.db');
        }
    } catch (error) {
        console.error('❌ Operation failed:', error.message);
        process.exit(1);
    } finally {
        backup.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseBackup;
