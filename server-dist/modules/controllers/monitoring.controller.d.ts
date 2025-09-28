import { Request, Response } from 'express';
import Database from 'better-sqlite3';
export declare class MonitoringController {
    private db;
    constructor(db: Database.Database);
    getSystemMetrics(req: Request, res: Response): Promise<void>;
    getSystemLogs(req: Request, res: Response): Promise<void>;
    getHealthStatus(req: Request, res: Response): Promise<void>;
    getPerformanceMetrics(req: Request, res: Response): Promise<void>;
    private checkDatabaseHealth;
    private checkMemoryHealth;
    private checkDiskHealth;
}
//# sourceMappingURL=monitoring.controller.d.ts.map