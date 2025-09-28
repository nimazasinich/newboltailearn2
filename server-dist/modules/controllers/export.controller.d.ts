import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Server } from 'socket.io';
export declare class ExportController {
    private db;
    private io;
    private activeExports;
    constructor(db: Database.Database, io: Server);
    exportProject(req: Request, res: Response): Promise<void>;
    exportModel(req: Request, res: Response): Promise<void>;
    getExportStatus(req: Request, res: Response): Promise<void>;
    downloadExport(req: Request, res: Response): Promise<void>;
    getProjectStructure(req: Request, res: Response): Promise<void>;
    generateProjectZip(req: Request, res: Response): Promise<void>;
    exportLogs(req: Request, res: Response): Promise<void>;
    exportDataset(req: Request, res: Response): Promise<void>;
    private processProjectExport;
}
//# sourceMappingURL=export.controller.d.ts.map