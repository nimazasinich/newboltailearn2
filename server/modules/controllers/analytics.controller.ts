import { Request, Response } from 'express';
import Database from 'better-sqlite3';

export class AnalyticsController {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async getBasicAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const modelStats = this.db.prepare(`
        SELECT 
          type,
          COUNT(*) as count,
          AVG(accuracy) as avg_accuracy,
          MAX(accuracy) as max_accuracy
        FROM models 
        GROUP BY type
      `).all();
      
      const trainingStats = this.db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as models_created
        FROM models 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date
      `).all();
      
      const summary = {
        totalModels: (this.db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number }).count,
        activeTraining: (this.db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get() as { count: number }).count,
        completedModels: (this.db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'completed'").get() as { count: number }).count,
        totalDatasets: (this.db.prepare('SELECT COUNT(*) as count FROM datasets').get() as { count: number }).count
      };

      res.json({
        modelStats,
        trainingStats,
        summary
      });
    } catch (error) {
      console.error('Get basic analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  async getAdvancedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Get model performance metrics
      const modelPerformance = this.db.prepare(`
        SELECT 
          m.id as modelId,
          m.name as modelName,
          m.type as modelType,
          m.accuracy,
          m.loss,
          m.epochs,
          m.current_epoch,
          m.created_at,
          m.updated_at,
          d.name as datasetName
        FROM models m
        LEFT JOIN datasets d ON m.dataset_id = d.id
        WHERE m.created_at >= date('now', '-${String(timeRange).replace('d', ' days')}')
        ORDER BY m.updated_at DESC
      `).all();
      
      res.json({
        modelPerformance,
        exportedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get advanced analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch advanced analytics' });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.query;

      let query = `
        SELECT 
          tl.epoch,
          tl.loss,
          tl.accuracy,
          tl.timestamp
        FROM training_logs tl
        WHERE tl.level = 'info'
      `;

      const params: any[] = [];

      if (modelId) {
        query += ' AND tl.model_id = ?';
        params.push(modelId);
      }

      query += ' ORDER BY tl.timestamp DESC LIMIT 100';

      const metrics = this.db.prepare(query).all(...params);

      res.json({
        metrics,
        modelId: modelId || 'all'
      });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }

  async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      const userStats = this.db.prepare(`
        SELECT 
          role,
          COUNT(*) as count,
          MAX(last_login) as last_activity
        FROM users 
        GROUP BY role
      `).all();

      const trainingStats = this.db.prepare(`
        SELECT 
          DATE(start_time) as date,
          COUNT(*) as sessions_started,
          AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completion_rate
        FROM training_sessions 
        WHERE start_time >= date('now', '-30 days')
        GROUP BY DATE(start_time)
        ORDER BY date
      `).all();

      const systemStats = {
        totalUsers: (this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count,
        totalModels: (this.db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number }).count,
        totalDatasets: (this.db.prepare('SELECT COUNT(*) as count FROM datasets').get() as { count: number }).count,
        totalTrainingSessions: (this.db.prepare('SELECT COUNT(*) as count FROM training_sessions').get() as { count: number }).count
      };

      res.json({
        userStats,
        trainingStats,
        systemStats,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get usage stats error:', error);
      res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
  }
}