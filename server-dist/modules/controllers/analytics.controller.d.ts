import { Request, Response } from 'express';
import Database from 'better-sqlite3';
export declare class AnalyticsController {
    private db;
    constructor(db: Database.Database);
    getBasicAnalytics(req: Request, res: Response): Promise<void>;
    getAdvancedAnalytics(req: Request, res: Response): Promise<void>;
    getPerformanceMetrics(req: Request, res: Response): Promise<void>;
    getUsageStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map