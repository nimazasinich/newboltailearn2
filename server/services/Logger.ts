import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id?: number;
  level: LogLevel;
  message: string;
  category: string;
  metadata?: any;
  userId?: number;
  requestId?: string;
  timestamp: string;
  source?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableDatabase: boolean;
  logDirectory: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
  database?: Database.Database;
}

export class Logger {
  private config: LoggerConfig;
  private logFile: string;
  private currentFileSize: number = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: true,
      enableDatabase: true,
      logDirectory: './logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };

    this.logFile = path.join(this.config.logDirectory, 'app.log');
    this.initializeLogging();
  }

  private initializeLogging(): void {
    // Create log directory
    if (this.config.enableFile && !fs.existsSync(this.config.logDirectory)) {
      fs.mkdirSync(this.config.logDirectory, { recursive: true });
    }

    // Initialize database logging
    if (this.config.enableDatabase && this.config.database) {
      this.initializeDatabaseLogging();
    }

    // Get current file size
    if (this.config.enableFile && fs.existsSync(this.logFile)) {
      this.currentFileSize = fs.statSync(this.logFile).size;
    }
  }

  private initializeDatabaseLogging(): void {
    if (!this.config.database) return;

    this.config.database.exec(`
      CREATE TABLE IF NOT EXISTS application_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT CHECK (level IN ('debug', 'info', 'warn', 'error')),
        message TEXT NOT NULL,
        category TEXT,
        metadata TEXT,
        user_id INTEGER,
        request_id TEXT,
        source TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
    this.config.database.exec(`
      CREATE INDEX IF NOT EXISTS idx_app_logs_level ON application_logs(level);
      CREATE INDEX IF NOT EXISTS idx_app_logs_category ON application_logs(category);
      CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON application_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON application_logs(user_id);
    `);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.config.level];
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    const userInfo = entry.userId ? ` [user:${entry.userId}]` : '';
    const requestInfo = entry.requestId ? ` [req:${entry.requestId}]` : '';
    const sourceInfo = entry.source ? ` [${entry.source}]` : '';
    
    return `[${timestamp}] ${entry.level.toUpperCase()} [${entry.category}]${userInfo}${requestInfo}${sourceInfo}: ${entry.message}${metadata}`;
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile) return;

    try {
      const logLine = this.formatLogEntry(entry) + '\n';
      
      // Check if we need to rotate the log file
      if (this.currentFileSize + logLine.length > this.config.maxFileSize) {
        await this.rotateLogFile();
      }

      fs.appendFileSync(this.logFile, logLine);
      this.currentFileSize += logLine.length;
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async rotateLogFile(): Promise<void> {
    try {
      // Rotate existing files
      for (let i = this.config.maxFiles - 1; i > 0; i--) {
        const oldFile = `${this.logFile}.${i}`;
        const newFile = `${this.logFile}.${i + 1}`;
        
        if (fs.existsSync(oldFile)) {
          if (i === this.config.maxFiles - 1) {
            fs.unlinkSync(oldFile); // Delete oldest file
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      // Move current log file
      if (fs.existsSync(this.logFile)) {
        fs.renameSync(this.logFile, `${this.logFile}.1`);
      }

      this.currentFileSize = 0;
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private async writeToDatabase(entry: LogEntry): Promise<void> {
    if (!this.config.enableDatabase || !this.config.database) return;

    try {
      this.config.database.prepare(`
        INSERT INTO application_logs (level, message, category, metadata, user_id, request_id, source, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        entry.level,
        entry.message,
        entry.category,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.userId,
        entry.requestId,
        entry.source,
        entry.timestamp
      );
    } catch (error) {
      console.error('Failed to write to database:', error);
    }
  }

  private async log(level: LogLevel, message: string, category: string = 'general', metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      category,
      metadata,
      userId,
      requestId,
      timestamp: new Date().toISOString(),
      source
    };

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatLogEntry(entry);
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }

    // File logging
    await this.writeToFile(entry);

    // Database logging
    await this.writeToDatabase(entry);
  }

  // Public logging methods
  async debug(message: string, category: string = 'general', metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void> {
    await this.log('debug', message, category, metadata, userId, requestId, source);
  }

  async info(message: string, category: string = 'general', metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void> {
    await this.log('info', message, category, metadata, userId, requestId, source);
  }

  async warn(message: string, category: string = 'general', metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void> {
    await this.log('warn', message, category, metadata, userId, requestId, source);
  }

  async error(message: string, category: string = 'general', metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void> {
    await this.log('error', message, category, metadata, userId, requestId, source);
  }

  // Specialized logging methods
  async logRequest(req: any, res: any, duration: number): Promise<void> {
    const metadata = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    await this.log(level, `${req.method} ${req.url} - ${res.statusCode}`, 'http', metadata, req.user?.id, req.requestId, 'express');
  }

  async logDatabase(operation: string, table: string, duration: number, error?: Error): Promise<void> {
    const metadata = {
      operation,
      table,
      duration,
      error: error?.message
    };

    const level = error ? 'error' : 'debug';
    await this.log(level, `Database ${operation} on ${table}`, 'database', metadata, undefined, undefined, 'database');
  }

  async logTraining(operation: string, modelId: string, progress?: any, error?: Error): Promise<void> {
    const metadata = {
      operation,
      modelId,
      progress,
      error: error?.message
    };

    const level = error ? 'error' : 'info';
    await this.log(level, `Training ${operation} for model ${modelId}`, 'training', metadata, undefined, undefined, 'training');
  }

  async logAuth(action: string, userId?: number, success: boolean = true, error?: Error): Promise<void> {
    const metadata = {
      action,
      success,
      error: error?.message
    };

    const level = success ? 'info' : 'warn';
    await this.log(level, `Authentication ${action}`, 'auth', metadata, userId, undefined, 'auth');
  }

  // Log retrieval methods
  getLogs(
    level?: LogLevel,
    category?: string,
    userId?: number,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    offset: number = 0
  ): LogEntry[] {
    if (!this.config.database) return [];

    try {
      let query = 'SELECT * FROM application_logs WHERE 1=1';
      const params: any[] = [];

      if (level) {
        query += ' AND level = ?';
        params.push(level);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      if (startDate) {
        query += ' AND timestamp >= ?';
        params.push(startDate.toISOString());
      }

      if (endDate) {
        query += ' AND timestamp <= ?';
        params.push(endDate.toISOString());
      }

      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const logs = this.config.database.prepare(query).all(...params) as any[];
      
      return logs.map(log => ({
        id: log.id,
        level: log.level,
        message: log.message,
        category: log.category,
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
        userId: log.user_id,
        requestId: log.request_id,
        timestamp: log.timestamp,
        source: log.source
      }));
    } catch (error) {
      console.error('Error retrieving logs:', error);
      return [];
    }
  }

  getLogStats(days: number = 7): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
    recentLogs: LogEntry[];
  } {
    if (!this.config.database) {
      return {
        totalLogs: 0,
        logsByLevel: { debug: 0, info: 0, warn: 0, error: 0 },
        logsByCategory: {},
        recentLogs: []
      };
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Total logs
      const totalLogs = this.config.database.prepare(`
        SELECT COUNT(*) as count FROM application_logs 
        WHERE timestamp >= ?
      `).get(cutoffDate.toISOString()) as { count: number };

      // Logs by level
      const logsByLevel = this.config.database.prepare(`
        SELECT level, COUNT(*) as count FROM application_logs 
        WHERE timestamp >= ?
        GROUP BY level
      `).all(cutoffDate.toISOString()) as { level: LogLevel; count: number }[];

      // Logs by category
      const logsByCategory = this.config.database.prepare(`
        SELECT category, COUNT(*) as count FROM application_logs 
        WHERE timestamp >= ?
        GROUP BY category
      `).all(cutoffDate.toISOString()) as { category: string; count: number }[];

      // Recent logs
      const recentLogs = this.getLogs(undefined, undefined, undefined, cutoffDate, undefined, 10);

      return {
        totalLogs: totalLogs.count,
        logsByLevel: logsByLevel.reduce((acc, item) => {
          acc[item.level] = item.count;
          return acc;
        }, { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>),
        logsByCategory: logsByCategory.reduce((acc, item) => {
          acc[item.category] = item.count;
          return acc;
        }, {} as Record<string, number>),
        recentLogs
      };
    } catch (error) {
      console.error('Error getting log stats:', error);
      return {
        totalLogs: 0,
        logsByLevel: { debug: 0, info: 0, warn: 0, error: 0 },
        logsByCategory: {},
        recentLogs: []
      };
    }
  }

  cleanOldLogs(daysToKeep: number = 30): number {
    if (!this.config.database) return 0;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = this.config.database.prepare(`
        DELETE FROM application_logs 
        WHERE timestamp < ?
      `).run(cutoffDate.toISOString());
      
      return result.changes;
    } catch (error) {
      console.error('Error cleaning old logs:', error);
      return 0;
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeLogging();
  }
}

// Create default logger instance
export const logger = new Logger({
  level: process.env.LOG_LEVEL as LogLevel || 'info',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: true,
  enableDatabase: true,
  logDirectory: './logs'
});