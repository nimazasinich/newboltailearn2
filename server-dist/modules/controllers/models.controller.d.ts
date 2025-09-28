import { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import { Server } from 'socket.io';
export declare class ModelsController {
    private db;
    private trainingService;
    constructor(db: Database.Database, io: Server);
    listModels(req: Request, res: Response): Promise<void>;
    getModel(req: Request, res: Response): Promise<void>;
    createModel(req: Request, res: Response): Promise<void>;
    updateModel(req: Request, res: Response): Promise<void>;
    deleteModel(req: Request, res: Response): Promise<void>;
    getModelLogs(req: Request, res: Response): Promise<void>;
    getModelCheckpoints(req: Request, res: Response): Promise<void>;
    exportModel(req: Request, res: Response): Promise<void>;
    startTraining(req: Request, res: Response, next: NextFunction): Promise<void>;
    pauseTraining(req: Request, res: Response, next: NextFunction): Promise<void>;
    resumeTraining(req: Request, res: Response, next: NextFunction): Promise<void>;
    startOptimization(req: Request, res: Response, next: NextFunction): Promise<void>;
    loadModel(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=models.controller.d.ts.map