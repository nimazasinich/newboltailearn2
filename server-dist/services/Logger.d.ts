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
    maxFileSize: number;
    maxFiles: number;
    database?: Database.Database;
}
export declare class Logger {
    private config;
    private logFile;
    private currentFileSize;
    constructor(config?: Partial<LoggerConfig>);
    private initializeLogging;
    private initializeDatabaseLogging;
    private shouldLog;
    private formatLogEntry;
    private writeToFile;
    private rotateLogFile;
    private writeToDatabase;
    private log;
    debug(message: string, category?: string, metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void>;
    info(message: string, category?: string, metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void>;
    warn(message: string, category?: string, metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void>;
    error(message: string, category?: string, metadata?: any, userId?: number, requestId?: string, source?: string): Promise<void>;
    logRequest(req: any, res: any, duration: number): Promise<void>;
    logDatabase(operation: string, table: string, duration: number, error?: Error): Promise<void>;
    logTraining(operation: string, modelId: string, progress?: any, error?: Error): Promise<void>;
    logAuth(action: string, userId?: number, success?: boolean, error?: Error): Promise<void>;
    getLogs(level?: LogLevel, category?: string, userId?: number, startDate?: Date, endDate?: Date, limit?: number, offset?: number): LogEntry[];
    getLogStats(days?: number): {
        totalLogs: number;
        logsByLevel: Record<LogLevel, number>;
        logsByCategory: Record<string, number>;
        recentLogs: LogEntry[];
    };
    cleanOldLogs(daysToKeep?: number): number;
    updateConfig(newConfig: Partial<LoggerConfig>): void;
}
export declare const logger: Logger;
//# sourceMappingURL=Logger.d.ts.map