import { isDemoMode } from '../security/config.js';
import { TrainingService } from '../services/trainingService.js';
export class ModelsController {
    constructor(db, io) {
        this.db = db;
        this.trainingService = new TrainingService(db, io);
    }
    async listModels(req, res) {
        try {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const models = this.db.prepare(`
        SELECT 
          id, name, type, status, accuracy, loss, epochs, 
          current_epoch, dataset_id, config, created_at, updated_at
        FROM models
        ORDER BY ${sort} ${order}
        LIMIT ? OFFSET ?
      `).all(Number(limit), offset);
            const total = this.db.prepare('SELECT COUNT(*) as count FROM models').get();
            res.json({
                models,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total.count,
                    pages: Math.ceil(total.count / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('List models error:', error);
            res.status(500).json({ error: 'Failed to list models' });
        }
    }
    async getModel(req, res) {
        try {
            const { id } = req.params;
            const model = this.db.prepare(`
        SELECT 
          id, name, type, status, accuracy, loss, epochs, 
          current_epoch, dataset_id, config, created_at, updated_at
        FROM models
        WHERE id = ?
      `).get(id);
            if (!model) {
                res.status(404).json({ error: 'Model not found' });
                return;
            }
            res.json(model);
        }
        catch (error) {
            console.error('Get model error:', error);
            res.status(500).json({ error: 'Failed to get model' });
        }
    }
    async createModel(req, res) {
        try {
            if (isDemoMode()) {
                res.status(403).json({ error: 'Model creation is disabled in demo mode' });
                return;
            }
            const { name, type, dataset_id, config } = req.body;
            const result = this.db.prepare(`
        INSERT INTO models (name, type, dataset_id, config, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(name, type, dataset_id || null, JSON.stringify(config || {}));
            const modelId = result.lastInsertRowid;
            // Log creation
            this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES ('info', 'models', 'Model created', ?, CURRENT_TIMESTAMP)
      `).run(JSON.stringify({ modelId, name, type, userId: req.user?.id }));
            res.status(201).json({
                id: modelId,
                name,
                type,
                dataset_id,
                config,
                status: 'idle',
                created_at: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Create model error:', error);
            res.status(500).json({ error: 'Failed to create model' });
        }
    }
    async updateModel(req, res) {
        try {
            if (isDemoMode()) {
                res.status(403).json({ error: 'Model updates are disabled in demo mode' });
                return;
            }
            const { id } = req.params;
            const updates = req.body;
            // Build update query
            const fields = Object.keys(updates).filter(key => ['name', 'status', 'accuracy', 'loss', 'current_epoch'].includes(key));
            if (fields.length === 0) {
                res.status(400).json({ error: 'No valid fields to update' });
                return;
            }
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => updates[field]);
            this.db.prepare(`
        UPDATE models 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);
            res.json({ success: true, message: 'Model updated successfully' });
        }
        catch (error) {
            console.error('Update model error:', error);
            res.status(500).json({ error: 'Failed to update model' });
        }
    }
    async deleteModel(req, res) {
        try {
            if (isDemoMode()) {
                res.status(403).json({ error: 'Model deletion is disabled in demo mode' });
                return;
            }
            const { id } = req.params;
            // Delete associated logs first
            this.db.prepare('DELETE FROM training_logs WHERE model_id = ?').run(id);
            // Delete model
            const result = this.db.prepare('DELETE FROM models WHERE id = ?').run(id);
            if (result.changes === 0) {
                res.status(404).json({ error: 'Model not found' });
                return;
            }
            // Log deletion
            this.db.prepare(`
        INSERT INTO system_logs (level, category, message, metadata, timestamp)
        VALUES ('info', 'models', 'Model deleted', ?, CURRENT_TIMESTAMP)
      `).run(JSON.stringify({ modelId: id, userId: req.user?.id }));
            res.json({ success: true, message: 'Model deleted successfully' });
        }
        catch (error) {
            console.error('Delete model error:', error);
            res.status(500).json({ error: 'Failed to delete model' });
        }
    }
    async getModelLogs(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const logs = this.db.prepare(`
        SELECT 
          id, level, message, epoch, loss, accuracy, timestamp
        FROM training_logs
        WHERE model_id = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `).all(id, Number(limit), offset);
            const total = this.db.prepare('SELECT COUNT(*) as count FROM training_logs WHERE model_id = ?').get(id);
            res.json({
                logs,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total.count,
                    pages: Math.ceil(total.count / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('Get model logs error:', error);
            res.status(500).json({ error: 'Failed to get model logs' });
        }
    }
    async getModelCheckpoints(req, res) {
        try {
            const { id } = req.params;
            const checkpoints = this.db.prepare(`
        SELECT 
          id, epoch, accuracy, loss, file_path, created_at
        FROM checkpoints
        WHERE model_id = ?
        ORDER BY epoch DESC
      `).all(id);
            res.json(checkpoints);
        }
        catch (error) {
            console.error('Get model checkpoints error:', error);
            res.status(500).json({ error: 'Failed to get model checkpoints' });
        }
    }
    async exportModel(req, res) {
        try {
            if (isDemoMode()) {
                res.status(403).json({ error: 'Model export is disabled in demo mode' });
                return;
            }
            const { id } = req.params;
            // Get model details
            const model = this.db.prepare(`
        SELECT * FROM models WHERE id = ?
      `).get(id);
            if (!model) {
                res.status(404).json({ error: 'Model not found' });
                return;
            }
            // TODO: Implement actual model export logic
            // For now, return a mock response
            res.json({
                success: true,
                message: 'Model export initiated',
                exportId: `export_${id}_${Date.now()}`,
                format: 'tensorflow',
                status: 'processing'
            });
        }
        catch (error) {
            console.error('Export model error:', error);
            res.status(500).json({ error: 'Failed to export model' });
        }
    }
    async startTraining(req, res, next) {
        try {
            const { id } = req.params;
            const { epochs = 10, batchSize = 32, learningRate = 0.001, datasetId = 'default' } = req.body;
            const modelId = parseInt(id);
            if (isNaN(modelId)) {
                res.status(400).json({ error: 'Invalid model ID' });
                return;
            }
            const trainingConfig = {
                epochs: Math.max(1, Math.min(100, epochs)),
                batchSize: Math.max(1, Math.min(128, batchSize)),
                learningRate: Math.max(0.0001, Math.min(0.1, learningRate)),
                validationSplit: 0.2,
                earlyStopping: true,
                patience: 5
            };
            const result = await this.trainingService.startTraining(modelId, datasetId, trainingConfig, req.user?.id || 1);
            if (result.success) {
                res.json({
                    success: true,
                    message: 'Training started successfully',
                    sessionId: result.sessionId,
                    config: trainingConfig
                });
            }
            else {
                res.status(400).json({ error: result.error });
            }
        }
        catch (error) {
            console.error('Start training error:', error);
            res.status(500).json({ error: 'Failed to start training' });
        }
    }
    async pauseTraining(req, res, next) {
        try {
            const { id } = req.params;
            const modelId = parseInt(id);
            if (isNaN(modelId)) {
                res.status(400).json({ error: 'Invalid model ID' });
                return;
            }
            const result = await this.trainingService.stopTraining(modelId);
            if (result.success) {
                res.json({ success: true, message: 'Training paused successfully' });
            }
            else {
                res.status(400).json({ error: result.error });
            }
        }
        catch (error) {
            console.error('Pause training error:', error);
            res.status(500).json({ error: 'Failed to pause training' });
        }
    }
    async resumeTraining(req, res, next) {
        try {
            const { id } = req.params;
            const { epochs = 10, batchSize = 32, learningRate = 0.001, datasetId = 'default' } = req.body;
            const modelId = parseInt(id);
            if (isNaN(modelId)) {
                res.status(400).json({ error: 'Invalid model ID' });
                return;
            }
            // Resume training by starting a new session
            const trainingConfig = {
                epochs: Math.max(1, Math.min(100, epochs)),
                batchSize: Math.max(1, Math.min(128, batchSize)),
                learningRate: Math.max(0.0001, Math.min(0.1, learningRate)),
                validationSplit: 0.2,
                earlyStopping: true,
                patience: 5
            };
            const result = await this.trainingService.startTraining(modelId, datasetId, trainingConfig, req.user?.id || 1);
            if (result.success) {
                res.json({
                    success: true,
                    message: 'Training resumed successfully',
                    sessionId: result.sessionId,
                    config: trainingConfig
                });
            }
            else {
                res.status(400).json({ error: result.error });
            }
        }
        catch (error) {
            console.error('Resume training error:', error);
            res.status(500).json({ error: 'Failed to resume training' });
        }
    }
    async startOptimization(req, res, next) {
        try {
            const { id } = req.params;
            const { optimizationType = 'hyperparameter', parameters = {} } = req.body;
            const modelId = parseInt(id);
            if (isNaN(modelId)) {
                res.status(400).json({ error: 'Invalid model ID' });
                return;
            }
            // For now, return a mock response for optimization
            res.json({
                success: true,
                message: 'Optimization started successfully',
                optimizationId: `opt_${modelId}_${Date.now()}`,
                type: optimizationType,
                parameters
            });
        }
        catch (error) {
            console.error('Start optimization error:', error);
            res.status(500).json({ error: 'Failed to start optimization' });
        }
    }
    async loadModel(req, res) {
        try {
            const { id } = req.params;
            const { checkpointPath } = req.body;
            const modelId = parseInt(id);
            if (isNaN(modelId)) {
                res.status(400).json({ error: 'Invalid model ID' });
                return;
            }
            // TODO: Implement actual model loading logic
            res.json({
                success: true,
                message: 'Model loaded successfully',
                modelId,
                checkpointPath
            });
        }
        catch (error) {
            console.error('Load model error:', error);
            res.status(500).json({ error: 'Failed to load model' });
        }
    }
}
