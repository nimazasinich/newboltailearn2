import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
export interface TrainingConfig {
    epochs: number;
    batchSize: number;
    learningRate: number;
    modelType: 'dora' | 'qr-adaptor' | 'persian-bert';
    datasetId: string;
    modelId?: string;
    sessionId?: string;
}
export interface TrainingProgress {
    epoch: number;
    totalEpochs: number;
    loss: number;
    accuracy: number;
    validationLoss?: number;
    validationAccuracy?: number;
    status: 'starting' | 'training' | 'paused' | 'completed' | 'failed';
    timestamp: number;
}
export declare class TrainingWorkerPool extends EventEmitter {
    private workers;
    private maxWorkers;
    private activeWorkers;
    constructor(maxWorkers?: number);
    createWorker(workerId: string, config: TrainingConfig): Promise<Worker>;
    private removeWorker;
    terminateWorker(workerId: string): Promise<void>;
    terminateAll(): Promise<void>;
    getActiveWorkerCount(): number;
    getWorkerIds(): string[];
}
export declare class WorkerManager {
    private workerPool;
    private trainingJobs;
    constructor(maxWorkers?: number);
    private setupEventHandlers;
    startTraining(jobId: string, config: TrainingConfig): Promise<Worker>;
    stopTraining(jobId: string): Promise<void>;
    getJobStatus(jobId: string): {
        config: TrainingConfig;
        status: string;
        startTime: number;
    } | undefined;
    getAllJobs(): Map<string, {
        config: TrainingConfig;
        status: string;
        startTime: number;
    }>;
    getActiveJobCount(): number;
    trainModel(request: any): Promise<any>;
    getWorkerMetrics(): any[];
    evaluateModel(request: any): Promise<any>;
    preprocessData(request: any): Promise<any>;
    optimizeHyperparameters(request: any): Promise<any>;
    terminate(): Promise<void>;
}
declare const trainingWorkerPool: TrainingWorkerPool;
export default trainingWorkerPool;
//# sourceMappingURL=trainingWorker.d.ts.map