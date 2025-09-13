import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { config, isDemoMode } from '../security/config.js';

export class ModelsController {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async listModels(req: Request, res: Response): Promise<void> {
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

      const total = this.db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number };

      res.json({
        models,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total.count,
          pages: Math.ceil(total.count / Number(limit))
        }
      });
    } catch (error) {
      console.error('List models error:', error);
      res.status(500).json({ error: 'Failed to list models' });
    }
  }

  async getModel(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Get model error:', error);
      res.status(500).json({ error: 'Failed to get model' });
    }
  }

  async createModel(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Create model error:', error);
      res.status(500).json({ error: 'Failed to create model' });
    }
  }

  async updateModel(req: Request, res: Response): Promise<void> {
    try {
      if (isDemoMode()) {
        res.status(403).json({ error: 'Model updates are disabled in demo mode' });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      // Build update query
      const fields = Object.keys(updates).filter(key => 
        ['name', 'status', 'accuracy', 'loss', 'current_epoch'].includes(key)
      );

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
    } catch (error) {
      console.error('Update model error:', error);
      res.status(500).json({ error: 'Failed to update model' });
    }
  }

  async deleteModel(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Delete model error:', error);
      res.status(500).json({ error: 'Failed to delete model' });
    }
  }

  async getModelLogs(req: Request, res: Response): Promise<void> {
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

      const total = this.db.prepare(
        'SELECT COUNT(*) as count FROM training_logs WHERE model_id = ?'
      ).get(id) as { count: number };

      res.json({
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total.count,
          pages: Math.ceil(total.count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get model logs error:', error);
      res.status(500).json({ error: 'Failed to get model logs' });
    }
  }

  async getModelCheckpoints(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Get model checkpoints error:', error);
      res.status(500).json({ error: 'Failed to get model checkpoints' });
    }
  }

  async exportModel(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error('Export model error:', error);
      res.status(500).json({ error: 'Failed to export model' });
    }
  }
}