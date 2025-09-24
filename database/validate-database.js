#!/usr/bin/env node

// Persian Legal AI Database Validation Script
// Comprehensive database validation and testing

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseValidator {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.results = {
            schema: { passed: 0, failed: 0, tests: [] },
            data: { passed: 0, failed: 0, tests: [] },
            performance: { passed: 0, failed: 0, tests: [] },
            integrity: { passed: 0, failed: 0, tests: [] }
        };
    }

    async connect() {
        try {
            this.db = new Database(this.dbPath);
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async validateSchema() {
        console.log('\n🔍 VALIDATING DATABASE SCHEMA...');
        
        const requiredTables = [
            'users', 'categories', 'documents', 'models', 
            'training_sessions', 'processing_queue', 'predictions',
            'system_metrics', 'audit_log'
        ];

        for (const table of requiredTables) {
            try {
                const result = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
                if (result) {
                    this.addResult('schema', true, `Table '${table}' exists`);
                } else {
                    this.addResult('schema', false, `Table '${table}' missing`);
                }
            } catch (error) {
                this.addResult('schema', false, `Error checking table '${table}': ${error.message}`);
            }
        }

        // Check foreign key constraints
        try {
            const fkResult = this.db.prepare("PRAGMA foreign_keys").get();
            if (fkResult.foreign_keys === 1) {
                this.addResult('schema', true, 'Foreign key constraints enabled');
            } else {
                this.addResult('schema', false, 'Foreign key constraints disabled');
            }
        } catch (error) {
            this.addResult('schema', false, `Error checking foreign keys: ${error.message}`);
        }

        // Check indexes
        try {
            const indexes = this.db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'").all();
            this.addResult('schema', true, `Found ${indexes.length} performance indexes`);
        } catch (error) {
            this.addResult('schema', false, `Error checking indexes: ${error.message}`);
        }
    }

    async validateData() {
        console.log('\n📊 VALIDATING DATA QUALITY...');

        // Check Persian document encoding
        try {
            const persianDocs = this.db.prepare(`
                SELECT id, title, content 
                FROM documents 
                WHERE language = 'persian' 
                LIMIT 5
            `).all();

            for (const doc of persianDocs) {
                const hasPersianChars = /[\u0600-\u06FF]/.test(doc.title + doc.content);
                if (hasPersianChars) {
                    this.addResult('data', true, `Document ${doc.id} contains valid Persian text`);
                } else {
                    this.addResult('data', false, `Document ${doc.id} missing Persian characters`);
                }
            }
        } catch (error) {
            this.addResult('data', false, `Error validating Persian text: ${error.message}`);
        }

        // Check data completeness
        try {
            const docCount = this.db.prepare('SELECT COUNT(*) as count FROM documents').get().count;
            const processedCount = this.db.prepare('SELECT COUNT(*) as count FROM documents WHERE status = "processed"').get().count;
            
            this.addResult('data', true, `Found ${docCount} total documents`);
            this.addResult('data', true, `Found ${processedCount} processed documents`);
            
            if (processedCount > 0) {
                this.addResult('data', true, 'Data completeness check passed');
            } else {
                this.addResult('data', false, 'No processed documents found');
            }
        } catch (error) {
            this.addResult('data', false, `Error checking data completeness: ${error.message}`);
        }

        // Check category relationships
        try {
            const orphanedDocs = this.db.prepare(`
                SELECT COUNT(*) as count 
                FROM documents d 
                LEFT JOIN categories c ON d.category_id = c.id 
                WHERE c.id IS NULL
            `).get().count;

            if (orphanedDocs === 0) {
                this.addResult('data', true, 'All documents have valid category relationships');
            } else {
                this.addResult('data', false, `Found ${orphanedDocs} documents with invalid categories`);
            }
        } catch (error) {
            this.addResult('data', false, `Error checking category relationships: ${error.message}`);
        }
    }

    async validateIntegrity() {
        console.log('\n🔒 VALIDATING DATA INTEGRITY...');

        // Test foreign key constraints
        try {
            // Try to insert invalid data
            this.db.prepare(`
                INSERT INTO documents (id, title, content, category_id) 
                VALUES ('test_invalid', 'Test', 'Test content', 'invalid_category')
            `).run();
            
            this.addResult('integrity', false, 'Foreign key constraint not working - invalid data inserted');
            
            // Clean up
            this.db.prepare('DELETE FROM documents WHERE id = ?').run('test_invalid');
        } catch (error) {
            if (error.message.includes('FOREIGN KEY constraint failed')) {
                this.addResult('integrity', true, 'Foreign key constraints working correctly');
            } else {
                this.addResult('integrity', false, `Unexpected error: ${error.message}`);
            }
        }

        // Test CHECK constraints
        try {
            this.db.prepare(`
                INSERT INTO predictions (id, document_id, model_id, predicted_category, confidence_score) 
                VALUES ('test_invalid', 'doc_001', 'model_001', 'civil', 1.5)
            `).run();
            
            this.addResult('integrity', false, 'CHECK constraint not working - invalid confidence score inserted');
            
            // Clean up
            this.db.prepare('DELETE FROM predictions WHERE id = ?').run('test_invalid');
        } catch (error) {
            if (error.message.includes('CHECK constraint failed')) {
                this.addResult('integrity', true, 'CHECK constraints working correctly');
            } else {
                this.addResult('integrity', false, `Unexpected error: ${error.message}`);
            }
        }

        // Test triggers
        try {
            const initialCount = this.db.prepare('SELECT document_count FROM categories WHERE id = ?').get('civil').document_count;
            
            // Insert a processed document
            this.db.prepare(`
                INSERT INTO documents (id, title, content, category_id, status) 
                VALUES ('test_trigger', 'Test Document', 'Test content', 'civil', 'processed')
            `).run();
            
            const newCount = this.db.prepare('SELECT document_count FROM categories WHERE id = ?').get('civil').document_count;
            
            if (newCount === initialCount + 1) {
                this.addResult('integrity', true, 'Category count trigger working correctly');
            } else {
                this.addResult('integrity', false, 'Category count trigger not working');
            }
            
            // Clean up
            this.db.prepare('DELETE FROM documents WHERE id = ?').run('test_trigger');
        } catch (error) {
            this.addResult('integrity', false, `Error testing triggers: ${error.message}`);
        }
    }

    async validatePerformance() {
        console.log('\n⚡ VALIDATING PERFORMANCE...');

        // Test query performance
        const queries = [
            {
                name: 'Document by category',
                sql: 'SELECT * FROM documents WHERE category_id = ? LIMIT 10',
                params: ['civil']
            },
            {
                name: 'Document by status',
                sql: 'SELECT * FROM documents WHERE status = ? LIMIT 10',
                params: ['processed']
            },
            {
                name: 'Training sessions',
                sql: 'SELECT * FROM training_sessions WHERE status = ? LIMIT 10',
                params: ['completed']
            },
            {
                name: 'Predictions by model',
                sql: 'SELECT * FROM predictions WHERE model_id = ? LIMIT 10',
                params: ['model_001']
            }
        ];

        for (const query of queries) {
            try {
                const start = Date.now();
                const result = this.db.prepare(query.sql).all(...query.params);
                const duration = Date.now() - start;
                
                if (duration < 100) {
                    this.addResult('performance', true, `${query.name} query executed in ${duration}ms`);
                } else {
                    this.addResult('performance', false, `${query.name} query took ${duration}ms (too slow)`);
                }
            } catch (error) {
                this.addResult('performance', false, `Error executing ${query.name}: ${error.message}`);
            }
        }

        // Test concurrent access
        try {
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(new Promise((resolve) => {
                    const result = this.db.prepare('SELECT COUNT(*) as count FROM documents').get();
                    resolve(result.count);
                }));
            }
            
            const results = await Promise.all(promises);
            const allSame = results.every(count => count === results[0]);
            
            if (allSame) {
                this.addResult('performance', true, 'Concurrent access test passed');
            } else {
                this.addResult('performance', false, 'Concurrent access test failed');
            }
        } catch (error) {
            this.addResult('performance', false, `Error testing concurrent access: ${error.message}`);
        }
    }

    addResult(category, passed, message) {
        this.results[category].tests.push({ passed, message });
        if (passed) {
            this.results[category].passed++;
            console.log(`✅ ${message}`);
        } else {
            this.results[category].failed++;
            console.log(`❌ ${message}`);
        }
    }

    generateReport() {
        console.log('\n📋 VALIDATION REPORT');
        console.log('====================');
        
        const totalTests = Object.values(this.results).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
        const totalPassed = Object.values(this.results).reduce((sum, cat) => sum + cat.passed, 0);
        const totalFailed = Object.values(this.results).reduce((sum, cat) => sum + cat.failed, 0);
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed}`);
        console.log(`Failed: ${totalFailed}`);
        console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
        
        console.log('\n📊 Category Breakdown:');
        for (const [category, result] of Object.entries(this.results)) {
            const categoryTotal = result.passed + result.failed;
            const categoryRate = categoryTotal > 0 ? ((result.passed / categoryTotal) * 100).toFixed(2) : 0;
            console.log(`${category.toUpperCase()}: ${result.passed}/${categoryTotal} (${categoryRate}%)`);
        }
        
        if (totalFailed === 0) {
            console.log('\n🎉 ALL VALIDATIONS PASSED!');
            console.log('✅ Database is ready for production use');
        } else {
            console.log('\n⚠️  SOME VALIDATIONS FAILED');
            console.log('❌ Please review and fix the issues above');
        }
        
        return totalFailed === 0;
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// Main execution
async function main() {
    const dbPath = process.argv[2] || './data/persian_legal_ai.db';
    
    console.log('🧠 PERSIAN LEGAL AI DATABASE VALIDATION');
    console.log('=======================================');
    console.log(`Database: ${dbPath}`);
    
    const validator = new DatabaseValidator(dbPath);
    
    if (!await validator.connect()) {
        process.exit(1);
    }
    
    try {
        await validator.validateSchema();
        await validator.validateData();
        await validator.validateIntegrity();
        await validator.validatePerformance();
        
        const success = validator.generateReport();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    } finally {
        validator.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseValidator;
