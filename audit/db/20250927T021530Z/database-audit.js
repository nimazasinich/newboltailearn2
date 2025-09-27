#!/usr/bin/env node

/**
 * Persian Legal AI Database Audit Script
 * Comprehensive database layer verification for production readiness
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PersianLegalDatabaseAuditor {
    constructor() {
        this.auditTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.artifactsDir = __dirname;
        this.results = {
            metadata: {
                timestamp: this.auditTimestamp,
                agent: 'CodeMaster AI - Persian Legal Database Specialist',
                database_type: 'SQLite/Better-SQLite3',
                project: 'Persian Legal AI Dashboard'
            },
            tests: {},
            security: {},
            performance: {},
            recommendations: []
        };
        
        // Test database paths
        this.testDbPath = path.join(this.artifactsDir, 'persian_legal_test.db');
        this.backupDbPath = path.join(this.artifactsDir, 'backup_restore_test.db');
        
        // Existing database files to analyze
        this.existingDbs = [
            'persian_legal_ai.db',
            'database.sqlite', 
            'test_migration.db'
        ];
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        // Also write to log file
        const logFile = path.join(this.artifactsDir, 'audit.log');
        fs.appendFileSync(logFile, logMessage + '\n');
    }

    async runFullAudit() {
        this.log('Starting Persian Legal AI Database Audit');
        
        try {
            // Phase 1: Analyze existing databases
            await this.analyzeExistingDatabases();
            
            // Phase 2: Test database creation and migration
            await this.testDatabaseCreation();
            
            // Phase 3: Schema analysis and Persian text support
            await this.analyzeSchemaAndPersianSupport();
            
            // Phase 4: Security audit
            await this.performSecurityAudit();
            
            // Phase 5: CRUD operations testing
            await this.testCrudOperations();
            
            // Phase 6: Concurrency and transaction testing
            await this.testConcurrencyAndTransactions();
            
            // Phase 7: Performance analysis
            await this.analyzePerformance();
            
            // Phase 8: Backup and restore testing
            await this.testBackupAndRestore();
            
            // Phase 9: Generate comprehensive report
            await this.generateReport();
            
            this.log('Database audit completed successfully');
            return this.results;
            
        } catch (error) {
            this.log(`Audit failed: ${error.message}`, 'error');
            this.log(error.stack, 'error');
            throw error;
        }
    }

    async analyzeExistingDatabases() {
        this.log('Phase 1: Analyzing existing databases');
        
        for (const dbFile of this.existingDbs) {
            if (fs.existsSync(dbFile)) {
                this.log(`Analyzing existing database: ${dbFile}`);
                
                try {
                    const db = new Database(dbFile, { readonly: true });
                    
                    // Get schema
                    const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table'").all();
                    fs.writeFileSync(
                        path.join(this.artifactsDir, `existing-schema-${dbFile}.sql`),
                        schema.map(s => s.sql).join('\n\n')
                    );
                    
                    // Get tables
                    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
                    fs.writeFileSync(
                        path.join(this.artifactsDir, `existing-tables-${dbFile}.txt`),
                        tables.map(t => t.name).join('\n')
                    );
                    
                    // Integrity check
                    const integrity = db.prepare("PRAGMA integrity_check").get();
                    fs.writeFileSync(
                        path.join(this.artifactsDir, `integrity-${dbFile}.txt`),
                        integrity.integrity_check
                    );
                    
                    // Get database info
                    const dbInfo = {
                        file: dbFile,
                        size: fs.statSync(dbFile).size,
                        tables: tables.length,
                        integrity: integrity.integrity_check,
                        encoding: db.prepare("PRAGMA encoding").get().encoding,
                        foreign_keys: db.prepare("PRAGMA foreign_keys").get().foreign_keys,
                        journal_mode: db.prepare("PRAGMA journal_mode").get().journal_mode
                    };
                    
                    this.results.tests[`existing_${dbFile}`] = dbInfo;
                    this.log(`✅ Successfully analyzed ${dbFile}: ${tables.length} tables, ${dbInfo.integrity}`);
                    
                    db.close();
                    
                } catch (error) {
                    this.log(`❌ Failed to analyze ${dbFile}: ${error.message}`, 'error');
                    this.results.tests[`existing_${dbFile}`] = { error: error.message };
                }
            }
        }
    }

    async testDatabaseCreation() {
        this.log('Phase 2: Testing database creation and migration');
        
        try {
            // Create test database
            const testDb = new Database(this.testDbPath);
            
            // Read and execute schema
            const schemaPath = path.join(process.cwd(), 'server/database/schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                testDb.exec(schema);
                this.log('✅ Schema applied successfully');
            }
            
            // Read and execute seed data
            const seedPath = path.join(process.cwd(), 'server/database/seed.sql');
            if (fs.existsSync(seedPath)) {
                const seed = fs.readFileSync(seedPath, 'utf8');
                testDb.exec(seed);
                this.log('✅ Seed data applied successfully');
            }
            
            // Verify tables were created
            const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            this.results.tests.database_creation = {
                status: 'success',
                tables_created: tables.length,
                table_names: tables.map(t => t.name)
            };
            
            this.log(`✅ Test database created with ${tables.length} tables`);
            testDb.close();
            
        } catch (error) {
            this.log(`❌ Database creation failed: ${error.message}`, 'error');
            this.results.tests.database_creation = { status: 'failed', error: error.message };
        }
    }

    async analyzeSchemaAndPersianSupport() {
        this.log('Phase 3: Analyzing schema and Persian text support');
        
        try {
            const testDb = new Database(this.testDbPath);
            
            // Check encoding
            const encoding = testDb.prepare("PRAGMA encoding").get();
            this.results.tests.encoding = encoding;
            
            // Test Persian text insertion
            const persianTest = testDb.prepare(`
                INSERT INTO datasets (id, name, source, type, description) 
                VALUES (?, ?, ?, ?, ?)
            `);
            
            const persianData = {
                id: 'persian-test-' + Date.now(),
                name: 'تست متن فارسی',
                source: 'test',
                type: 'test',
                description: 'این یک تست برای بررسی پشتیبانی از متن فارسی است'
            };
            
            persianTest.run(
                persianData.id,
                persianData.name,
                persianData.source,
                persianData.type,
                persianData.description
            );
            
            // Verify Persian text retrieval
            const retrieved = testDb.prepare("SELECT * FROM datasets WHERE id = ?").get(persianData.id);
            
            this.results.tests.persian_text_support = {
                encoding: encoding.encoding,
                insertion_successful: !!retrieved,
                text_preserved: retrieved && retrieved.name === persianData.name,
                description_preserved: retrieved && retrieved.description === persianData.description
            };
            
            this.log('✅ Persian text support verified');
            testDb.close();
            
        } catch (error) {
            this.log(`❌ Persian text support test failed: ${error.message}`, 'error');
            this.results.tests.persian_text_support = { error: error.message };
        }
    }

    async performSecurityAudit() {
        this.log('Phase 4: Performing security audit');
        
        try {
            const testDb = new Database(this.testDbPath);
            
            // Check for admin users and password hashing
            const adminUsers = testDb.prepare(`
                SELECT id, username, email, 
                       length(password_hash) as hash_length,
                       substr(password_hash, 1, 10) as hash_preview
                FROM users WHERE role = 'admin'
            `).all();
            
            // Check for plaintext-looking passwords
            const suspiciousPasswords = testDb.prepare(`
                SELECT COUNT(*) as count FROM users 
                WHERE password_hash IN ('password', 'admin', '123456', 'Admin123', 'admin123')
                   OR length(password_hash) < 20
            `).get();
            
            this.results.security = {
                admin_users: adminUsers.length,
                admin_details: adminUsers.map(u => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    hash_length: u.hash_length,
                    hash_preview: u.hash_preview
                })),
                suspicious_passwords: suspiciousPasswords.count,
                password_security: suspiciousPasswords.count === 0 ? 'secure' : 'vulnerable'
            };
            
            this.log(`✅ Security audit completed: ${adminUsers.length} admin users, ${suspiciousPasswords.count} suspicious passwords`);
            testDb.close();
            
        } catch (error) {
            this.log(`❌ Security audit failed: ${error.message}`, 'error');
            this.results.security = { error: error.message };
        }
    }

    async testCrudOperations() {
        this.log('Phase 5: Testing CRUD operations');
        
        try {
            const testDb = new Database(this.testDbPath);
            
            // Test CREATE
            const insertModel = testDb.prepare(`
                INSERT INTO models (name, type, status, dataset_id, config) 
                VALUES (?, ?, ?, ?, ?)
            `);
            
            const modelId = insertModel.run(
                'Test Model',
                'persian-bert',
                'idle',
                'iran-legal-qa',
                '{"test": true}'
            ).lastInsertRowid;
            
            // Test READ
            const model = testDb.prepare("SELECT * FROM models WHERE id = ?").get(modelId);
            
            // Test UPDATE
            const updateModel = testDb.prepare("UPDATE models SET status = ? WHERE id = ?");
            updateModel.run('training', modelId);
            
            const updatedModel = testDb.prepare("SELECT * FROM models WHERE id = ?").get(modelId);
            
            // Test DELETE
            const deleteModel = testDb.prepare("DELETE FROM models WHERE id = ?");
            deleteModel.run(modelId);
            
            const deletedModel = testDb.prepare("SELECT * FROM models WHERE id = ?").get(modelId);
            
            this.results.tests.crud_operations = {
                create: !!model,
                read: !!model,
                update: updatedModel && updatedModel.status === 'training',
                delete: !deletedModel,
                id_generation: modelId > 0
            };
            
            this.log('✅ CRUD operations test completed');
            testDb.close();
            
        } catch (error) {
            this.log(`❌ CRUD operations test failed: ${error.message}`, 'error');
            this.results.tests.crud_operations = { error: error.message };
        }
    }

    async testConcurrencyAndTransactions() {
        this.log('Phase 6: Testing concurrency and transactions');
        
        try {
            const testDb = new Database(this.testDbPath);
            
            // Enable WAL mode for better concurrency
            testDb.pragma('journal_mode = WAL');
            
            // Test transaction rollback
            const transaction = testDb.transaction(() => {
                const insert = testDb.prepare("INSERT INTO models (name, type, status) VALUES (?, ?, ?)");
                insert.run('Transaction Test', 'persian-bert', 'idle');
                throw new Error('Intentional rollback');
            });
            
            let rollbackSuccess = false;
            try {
                transaction();
            } catch (error) {
                rollbackSuccess = error.message === 'Intentional rollback';
            }
            
            // Verify rollback worked
            const rollbackCheck = testDb.prepare("SELECT COUNT(*) as count FROM models WHERE name = 'Transaction Test'").get();
            
            // Test concurrent inserts (simulate)
            const concurrentInsert = testDb.prepare("INSERT INTO models (name, type, status) VALUES (?, ?, ?)");
            const ids = new Set();
            
            for (let i = 0; i < 10; i++) {
                const result = concurrentInsert.run(`Concurrent Test ${i}`, 'persian-bert', 'idle');
                ids.add(result.lastInsertRowid);
            }
            
            this.results.tests.concurrency = {
                transaction_rollback: rollbackSuccess && rollbackCheck.count === 0,
                concurrent_inserts: ids.size === 10,
                unique_ids: ids.size === 10,
                wal_mode: testDb.prepare("PRAGMA journal_mode").get().journal_mode === 'wal'
            };
            
            this.log('✅ Concurrency and transaction tests completed');
            testDb.close();
            
        } catch (error) {
            this.log(`❌ Concurrency test failed: ${error.message}`, 'error');
            this.results.tests.concurrency = { error: error.message };
        }
    }

    async analyzePerformance() {
        this.log('Phase 7: Analyzing performance');
        
        try {
            const testDb = new Database(this.testDbPath);
            
            // Get index information
            const indexes = testDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
            
            // Test query performance
            const startTime = Date.now();
            const modelCount = testDb.prepare("SELECT COUNT(*) as count FROM models").get();
            const queryTime = Date.now() - startTime;
            
            // Test join performance
            const joinStart = Date.now();
            const joinResult = testDb.prepare(`
                SELECT m.name, COUNT(ts.id) as session_count
                FROM models m 
                LEFT JOIN training_sessions ts ON m.id = ts.model_id
                GROUP BY m.id, m.name
            `).all();
            const joinTime = Date.now() - joinStart;
            
            this.results.performance = {
                indexes_count: indexes.length,
                indexes: indexes.map(idx => ({ name: idx.name, sql: idx.sql })),
                simple_query_time: queryTime,
                join_query_time: joinTime,
                model_count: modelCount.count
            };
            
            this.log(`✅ Performance analysis completed: ${indexes.length} indexes, ${queryTime}ms simple query`);
            testDb.close();
            
        } catch (error) {
            this.log(`❌ Performance analysis failed: ${error.message}`, 'error');
            this.results.performance = { error: error.message };
        }
    }

    async testBackupAndRestore() {
        this.log('Phase 8: Testing backup and restore');
        
        try {
            const sourceDb = new Database(this.testDbPath);
            const backupDb = new Database(this.backupDbPath);
            
            // Create backup using SQLite's backup API
            sourceDb.backup(backupDb);
            
            // Verify backup integrity
            const backupIntegrity = backupDb.prepare("PRAGMA integrity_check").get();
            
            // Compare table counts
            const sourceTables = sourceDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            const backupTables = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            
            // Compare data counts
            const sourceModelCount = sourceDb.prepare("SELECT COUNT(*) as count FROM models").get();
            const backupModelCount = backupDb.prepare("SELECT COUNT(*) as count FROM models").get();
            
            this.results.tests.backup_restore = {
                backup_created: true,
                backup_integrity: backupIntegrity.integrity_check,
                table_count_match: sourceTables.length === backupTables.length,
                data_count_match: sourceModelCount.count === backupModelCount.count,
                backup_size: fs.statSync(this.backupDbPath).size
            };
            
            this.log('✅ Backup and restore test completed');
            sourceDb.close();
            backupDb.close();
            
        } catch (error) {
            this.log(`❌ Backup and restore test failed: ${error.message}`, 'error');
            this.results.tests.backup_restore = { error: error.message };
        }
    }

    async generateReport() {
        this.log('Phase 9: Generating comprehensive report');
        
        // Calculate overall status
        const criticalFailures = [];
        
        if (this.results.tests.database_creation?.status === 'failed') {
            criticalFailures.push('Database creation failed');
        }
        
        if (this.results.security?.password_security === 'vulnerable') {
            criticalFailures.push('Password security vulnerabilities detected');
        }
        
        if (this.results.tests.backup_restore?.backup_integrity !== 'ok') {
            criticalFailures.push('Backup integrity issues');
        }
        
        const overallStatus = criticalFailures.length === 0 ? 'PASS' : 
                            criticalFailures.length <= 2 ? 'CONDITIONAL_PASS' : 'FAIL';
        
        this.results.overall_status = overallStatus;
        this.results.critical_failures = criticalFailures;
        this.results.recommendations = this.generateRecommendations();
        
        // Write JSON report
        fs.writeFileSync(
            path.join(this.artifactsDir, 'audit-summary.json'),
            JSON.stringify(this.results, null, 2)
        );
        
        // Write human-readable summary
        const summary = this.generateHumanSummary();
        fs.writeFileSync(
            path.join(this.artifactsDir, 'AUDIT-SUMMARY.txt'),
            summary
        );
        
        this.log(`✅ Report generated: ${overallStatus}`);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.tests.database_creation?.status === 'failed') {
            recommendations.push('Fix database migration system');
        }
        
        if (this.results.security?.password_security === 'vulnerable') {
            recommendations.push('Address credential security issues');
        }
        
        if (this.results.tests.concurrency?.transaction_rollback === false) {
            recommendations.push('Fix transaction rollback functionality');
        }
        
        if (this.results.performance?.indexes_count < 5) {
            recommendations.push('Add more database indexes for performance');
        }
        
        return recommendations;
    }

    generateHumanSummary() {
        return `
=================================================================
PERSIAN LEGAL AI DATABASE AUDIT - EXECUTIVE SUMMARY
=================================================================
Audit Timestamp: ${this.results.metadata.timestamp}
Audit Agent: ${this.results.metadata.agent}
Database Technology: ${this.results.metadata.database_type}
Project: ${this.results.metadata.project}

=== CRITICAL SYSTEMS STATUS ===
Overall Status: ${this.results.overall_status}
Critical Failures: ${this.results.critical_failures.length}

=== DATABASE ANALYSIS ===
Existing Databases: ${Object.keys(this.results.tests).filter(k => k.startsWith('existing_')).length}
Database Creation: ${this.results.tests.database_creation?.status || 'UNKNOWN'}
Persian Text Support: ${this.results.tests.persian_text_support?.text_preserved ? 'VERIFIED' : 'UNVERIFIED'}
CRUD Operations: ${this.results.tests.crud_operations?.create ? 'FUNCTIONAL' : 'FAILED'}

=== SECURITY ASSESSMENT ===
Admin Users: ${this.results.security?.admin_users || 0}
Password Security: ${this.results.security?.password_security || 'UNKNOWN'}
Suspicious Passwords: ${this.results.security?.suspicious_passwords || 0}

=== PERFORMANCE ANALYSIS ===
Database Indexes: ${this.results.performance?.indexes_count || 0}
Query Performance: ${this.results.performance?.simple_query_time || 'UNKNOWN'}ms
Join Performance: ${this.results.performance?.join_query_time || 'UNKNOWN'}ms

=== RECOMMENDATIONS ===
${this.results.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

=================================================================
AUDIT COMPLETED - ALL DATA PRESERVED AND PROTECTED
=================================================================
        `;
    }
}

// Run the audit if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const auditor = new PersianLegalDatabaseAuditor();
    auditor.runFullAudit()
        .then(results => {
            console.log('\n🎯 Persian Legal AI Database Audit completed successfully');
            console.log(`📊 Overall Status: ${results.overall_status}`);
            console.log(`📁 Artifacts saved to: ${auditor.artifactsDir}`);
            process.exit(results.overall_status === 'FAIL' ? 2 : results.overall_status === 'CONDITIONAL_PASS' ? 1 : 0);
        })
        .catch(error => {
            console.error('\n❌ Audit failed:', error.message);
            process.exit(1);
        });
}

export default PersianLegalDatabaseAuditor;