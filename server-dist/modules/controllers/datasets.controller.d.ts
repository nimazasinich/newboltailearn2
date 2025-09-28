import { Request, Response } from 'express';
import Database from 'better-sqlite3';
export declare class DatasetsController {
    private db;
    constructor(db: Database.Database);
    listDatasets(req: Request, res: Response): Promise<void>;
    getDataset(req: Request, res: Response): Promise<void>;
    createDataset(req: Request, res: Response): Promise<void>;
    updateDataset(req: Request, res: Response): Promise<void>;
    deleteDataset(req: Request, res: Response): Promise<void>;
    downloadDataset(req: Request, res: Response): Promise<void>;
    processDataset(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=datasets.controller.d.ts.map