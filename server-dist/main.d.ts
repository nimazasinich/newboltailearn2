import { AuthService } from './services/authService';
import { ModelPersistence } from './services/ModelPersistence';
import { PersianLegalProcessor } from './services/PersianLegalProcessor';
import { Logger } from './services/Logger';
import { HealthMonitor } from './services/HealthMonitor';
import { ErrorHandler } from './middleware/errorHandler';
import { RealTrainingEngine } from './training/RealTrainingEngine';
declare class PersianLegalAIServer {
    private app;
    private server;
    private io;
    private db;
    private logger;
    private errorHandler;
    private healthMonitor;
    private authService;
    private modelPersistence;
    private documentProcessor;
    private trainingEngine;
    constructor();
    private initializeDatabase;
    private initializeServices;
    private setupMiddleware;
    private setupRoutes;
    private setupSocketIO;
    private setupErrorHandling;
    private setupGlobalHandlers;
    start(port?: number): Promise<void>;
    private shutdown;
    getServices(): {
        logger: Logger;
        errorHandler: ErrorHandler;
        healthMonitor: HealthMonitor;
        authService: AuthService;
        modelPersistence: ModelPersistence;
        documentProcessor: PersianLegalProcessor;
        trainingEngine: RealTrainingEngine;
    };
}
export default PersianLegalAIServer;
//# sourceMappingURL=main.d.ts.map