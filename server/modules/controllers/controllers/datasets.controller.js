"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetsController = void 0;
const config_js_1 = require("../security/config.js");
class DatasetsController {
    constructor(db) {
        this.db = db;
    }
    async listDatasets(req, res) {
        try {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const datasets = this.db.prepare(`
        SELECT 
          id, name, type, status, size_mb AS size, samples AS records, 
          description, source, created_at, updated_at
        FROM datasets
        ORDER BY ${sort} ${order}
        LIMIT ? OFFSET ?
      `).all(Number(limit), offset);
            const total = this.db.prepare('SELECT COUNT(*) as count FROM datasets').get();
            res.json({
                datasets,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total.count,
                    pages: Math.ceil(total.count / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('List datasets error:', error);
            res.status(500).json({ error: 'Failed to list datasets' });
        }
    }
    async getDataset(req, res) {
        try {
            const { id } = req.params;
            const dataset = this.db.prepare(`
        SELECT 
          id, name, type, status, size_mb AS size, samples AS records, 
          description, source, created_at, updated_at
        FROM datasets
        WHERE id = ?
      `).get(id);
            if (!dataset) {
                res.status(404).json({ error: 'Dataset not found' });
                return;
            }
            res.json(dataset);
        }
        catch (error) {
            console.error('Get dataset error:', error);
            res.status(500).json({ error: 'Failed to get dataset' });
        }
    }
    async createDataset(req, res) {
        try {
            if ((0, config_js_1.isDemoMode)()) {
                res.status(403).json({ error: 'Dataset creation is disabled in demo mode' });
                return;
            }
            const { name, type, description, source } = req.body;
            const result = this.db.prepare(`
        INSERT INTO datasets (name, type, description, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(name, type, description || '', source || '');
            const datasetId = result.lastInsertRowid;
            // Log creation
            this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES ('info', 'datasets', 'Dataset created', ?, CURRENT_TIMESTAMP)
      `).run(JSON.stringify({ datasetId, name, type, userId: req.user?.id }));
            res.status(201).json({
                id: datasetId,
                name,
                type,
                description,
                source,
                status: 'idle',
                created_at: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Create dataset error:', error);
            res.status(500).json({ error: 'Failed to create dataset' });
        }
    }
    async updateDataset(req, res) {
        try {
            if ((0, config_js_1.isDemoMode)()) {
                res.status(403).json({ error: 'Dataset updates are disabled in demo mode' });
                return;
            }
            const { id } = req.params;
            const updates = req.body;
            // Build update query
            const fields = Object.keys(updates).filter(key => ['name', 'description', 'status'].includes(key));
            if (fields.length === 0) {
                res.status(400).json({ error: 'No valid fields to update' });
                return;
            }
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => updates[field]);
            this.db.prepare(`
        UPDATE datasets 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);
            res.json({ success: true, message: 'Dataset updated successfully' });
        }
        catch (error) {
            console.error('Update dataset error:', error);
            res.status(500).json({ error: 'Failed to update dataset' });
        }
    }
    async deleteDataset(req, res) {
        try {
            if ((0, config_js_1.isDemoMode)()) {
                res.status(403).json({ error: 'Dataset deletion is disabled in demo mode' });
                return;
            }
            const { id } = req.params;
            // Delete dataset
            const result = this.db.prepare('DELETE FROM datasets WHERE id = ?').run(id);
            if (result.changes === 0) {
                res.status(404).json({ error: 'Dataset not found' });
                return;
            }
            // Log deletion
            this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES ('info', 'datasets', 'Dataset deleted', ?, CURRENT_TIMESTAMP)
      `).run(JSON.stringify({ datasetId: id, userId: req.user?.id }));
            res.json({ success: true, message: 'Dataset deleted successfully' });
        }
        catch (error) {
            console.error('Delete dataset error:', error);
            res.status(500).json({ error: 'Failed to delete dataset' });
        }
    }
    async downloadDataset(req, res) {
        try {
            const { id } = req.params;
            const dataset = this.db.prepare('SELECT * FROM datasets WHERE id = ?').get(id);
            if (!dataset) {
                res.status(404).json({ error: 'Dataset not found' });
                return;
            }
            // Update status to downloading
            this.db.prepare('UPDATE datasets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run('downloading', id);
            // TODO: Implement actual download logic
            res.json({
                success: true,
                message: 'Dataset download started',
                datasetId: id
            });
        }
        catch (error) {
            console.error('Download dataset error:', error);
            res.status(500).json({ error: 'Failed to download dataset' });
        }
    }
    async processDataset(req, res) {
        try {
            const { id } = req.params;
            const { processType = 'tokenize' } = req.body;
            const dataset = this.db.prepare('SELECT * FROM datasets WHERE id = ?').get(id);
            if (!dataset) {
                res.status(404).json({ error: 'Dataset not found' });
                return;
            }
            // Update status to processing
            this.db.prepare('UPDATE datasets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run('processing', id);
            // TODO: Implement actual processing logic
            res.json({
                success: true,
                message: 'Dataset processing started',
                datasetId: id,
                processType
            });
        }
        catch (error) {
            console.error('Process dataset error:', error);
            res.status(500).json({ error: 'Failed to process dataset' });
        }
    }
}
exports.DatasetsController = DatasetsController;
