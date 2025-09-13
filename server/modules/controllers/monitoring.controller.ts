import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import os from 'os';

export class MonitoringController {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      
      // Get system memory
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      const metrics = {
        cpu: 0, // Simplified for now
        memory: {
          used: Math.round(usedMem / 1024 / 1024),
          total: Math.round(totalMem / 1024 / 1024),
          percentage: Math.round((usedMem / totalMem) * 100)
        },
        process_memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        uptime: Math.floor(process.uptime()),
        system_uptime: Math.floor(os.uptime()),
        platform: os.platform(),
        arch: os.arch(),
        timestamp: new Date().toISOString()
      };
      
      // Get training status
      const trainingModels = this.db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'training'").get() as { count: number };
      const totalModels = this.db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number };
      const completedModels = this.db.prepare("SELECT COUNT(*) as count FROM models WHERE status = 'completed'").get() as { count: number };
      
      res.json({
        ...metrics,
        training: {
          active: trainingModels.count,
          total: totalModels.count,
          completed: completedModels.count
        }
      });
    } catch (error) {
      console.error('Get system metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch monitoring data' });
    }
  }

  async getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, level, category } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          id, level, category, message, metadata, timestamp
        FROM system_logs
        WHERE 1=1
      `;
      const params: any[] = [];

      if (level) {
        query += ' AND level = ?';
        params.push(level);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);

      const logs = this.db.prepare(query).all(...params);

      const total = this.db.prepare(`
        SELECT COUNT(*) as count FROM system_logs 
        WHERE 1=1 ${level ? 'AND level = ?' : ''} ${category ? 'AND category = ?' : ''}
      `).get(...(level ? [level] : []), ...(category ? [category] : [])) as { count: number };

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
      console.error('Get system logs error:', error);
      res.status(500).json({ error: 'Failed to fetch system logs' });
    }
  }

  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: this.db.open ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: this.checkDatabaseHealth(),
          memory: this.checkMemoryHealth(),
          disk: this.checkDiskHealth()
        }
      };

      const overallStatus = Object.values(health.checks).every(check => check.status === 'healthy') 
        ? 'healthy' : 'degraded';

      res.json({
        ...health,
        status: overallStatus
      });
    } catch (error) {
      console.error('Get health status error:', error);
      res.status(500).json({ 
        status: 'unhealthy',
        error: 'Failed to check health status',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const performance = {
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      res.json(performance);
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }

  private checkDatabaseHealth(): { status: string; message?: string } {
    try {
      this.db.prepare('SELECT 1').get();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed' };
    }
  }

  private checkMemoryHealth(): { status: string; message?: string } {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

    if (usagePercentage > 90) {
      return { status: 'unhealthy', message: 'High memory usage' };
    } else if (usagePercentage > 75) {
      return { status: 'degraded', message: 'Elevated memory usage' };
    }

    return { status: 'healthy' };
  }

  private checkDiskHealth(): { status: string; message?: string } {
    // Simplified disk health check
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Disk access failed' };
    }
  }
}