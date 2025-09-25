#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
const dbPath = path.join(__dirname, '..', '..', 'data', 'persian_legal_ai.db');
const db = new Database(dbPath);

console.log('🗄️  Populating database with sample data...');

try {
    // Insert sample datasets
    const datasets = [
        {
            name: 'Persian Legal QA Dataset',
            type: 'qa',
            status: 'available',
            size_mb: 45.2,
            samples: 15000,
            description: 'مجموعه داده پرسش و پاسخ حقوقی فارسی شامل 15 هزار جفت پرسش و پاسخ',
            source: 'Internal'
        },
        {
            name: 'Court Decisions Dataset',
            type: 'classification',
            status: 'available',
            size_mb: 32.1,
            samples: 8500,
            description: 'مجموعه تصمیمات دادگاه شامل رای‌های مختلف دادگاه‌های کشور',
            source: 'Public'
        },
        {
            name: 'Legal Documents Corpus',
            type: 'documents',
            status: 'available',
            size_mb: 78.5,
            samples: 25000,
            description: 'مجموعه اسناد حقوقی شامل قراردادها، قوانین و مقررات',
            source: 'Internal'
        }
    ];

    console.log('📊 Inserting sample datasets...');
    for (const dataset of datasets) {
        const result = db.prepare(`
            INSERT INTO datasets (name, type, status, size_mb, samples, description, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(dataset.name, dataset.type, dataset.status, dataset.size_mb, dataset.samples, dataset.description, dataset.source);
        console.log(`✅ Inserted dataset: ${dataset.name} (ID: ${result.lastInsertRowid})`);
    }

    // Insert sample models
    const models = [
        {
            name: 'Persian BERT Legal',
            type: 'persian-bert',
            status: 'training',
            accuracy: 0.89,
            epochs: 50,
            training_progress: 64.0
        },
        {
            name: 'Legal QA Model',
            type: 'dora',
            status: 'completed',
            accuracy: 0.94,
            epochs: 30,
            training_progress: 100.0
        },
        {
            name: 'Document Classifier',
            type: 'qr-adaptor',
            status: 'training',
            accuracy: 0.76,
            epochs: 40,
            training_progress: 45.0
        },
        {
            name: 'Legal Text Summarizer',
            type: 'persian-bert',
            status: 'idle',
            accuracy: 0.0,
            epochs: 0,
            training_progress: 0.0
        }
    ];

    console.log('🤖 Inserting sample models...');
    for (const model of models) {
        const result = db.prepare(`
            INSERT INTO models (name, type, status, accuracy, epochs, training_progress)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(model.name, model.type, model.status, model.accuracy, model.epochs, model.training_progress);
        console.log(`✅ Inserted model: ${model.name} (ID: ${result.lastInsertRowid})`);
    }

    // Insert sample training sessions
    const sessions = [
        {
            model_id: 1,
            session_name: 'Persian BERT Training Session 1',
            status: 'training',
            progress: 64.0,
            current_epoch: 32,
            total_epochs: 50,
            accuracy: 0.89,
            loss: 0.23,
            learning_rate: 0.001,
            batch_size: 32
        },
        {
            model_id: 2,
            session_name: 'Legal QA Training Session 1',
            status: 'completed',
            progress: 100.0,
            current_epoch: 30,
            total_epochs: 30,
            accuracy: 0.94,
            loss: 0.15,
            learning_rate: 0.001,
            batch_size: 16
        },
        {
            model_id: 3,
            session_name: 'Document Classifier Training Session 1',
            status: 'training',
            progress: 45.0,
            current_epoch: 18,
            total_epochs: 40,
            accuracy: 0.76,
            loss: 0.35,
            learning_rate: 0.0005,
            batch_size: 64
        }
    ];

    console.log('🎯 Inserting sample training sessions...');
    for (const session of sessions) {
        const result = db.prepare(`
            INSERT INTO training_sessions (model_id, session_name, status, progress, current_epoch, total_epochs, accuracy, loss, learning_rate, batch_size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(session.model_id, session.session_name, session.status, session.progress, session.current_epoch, session.total_epochs, session.accuracy, session.loss, session.learning_rate, session.batch_size);
        console.log(`✅ Inserted training session: ${session.session_name} (ID: ${result.lastInsertRowid})`);
    }

    console.log('🎉 Database populated successfully!');
    console.log(`📊 Total datasets: ${db.prepare('SELECT COUNT(*) as count FROM datasets').get().count}`);
    console.log(`🤖 Total models: ${db.prepare('SELECT COUNT(*) as count FROM models').get().count}`);
    console.log(`🎯 Total training sessions: ${db.prepare('SELECT COUNT(*) as count FROM training_sessions').get().count}`);

} catch (error) {
    console.error('❌ Error populating database:', error);
} finally {
    db.close();
}
