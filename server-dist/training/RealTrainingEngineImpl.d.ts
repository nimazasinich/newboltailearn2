import { EventEmitter } from 'events';
export interface ModelConfig {
    numClasses?: number;
    modelType?: 'dora' | 'qr-adaptor' | 'persian-bert';
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    validationSplit?: number;
}
export interface TrainingMetrics {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
}
export interface TrainingData {
    xs: any;
    ys: any;
}
export declare class RealTrainingEngineImpl extends EventEmitter {
    private model;
    private isTraining;
    private trainingHistory;
    private currentConfig;
    constructor();
    initializeModel(config?: ModelConfig): Promise<void>;
    private createModelLayers;
    private simulateTraining;
    private simulatePredict;
    trainModel(trainingData: TrainingData, config: ModelConfig): Promise<void>;
    stopTraining(): Promise<void>;
    saveModel(modelPath: string): Promise<void>;
    loadModel(modelPath: string): Promise<void>;
    predict(inputData: any): Promise<any>;
    getTrainingStatus(): boolean;
    getTrainingHistory(): TrainingMetrics[];
    getCurrentConfig(): ModelConfig | null;
    getModelInfo(): any;
    getModel(): any;
    dispose(): void;
    startTraining(config: any, callbacks: any): Promise<void>;
    train(modelId: string, datasetId: string, config: any, progressCallback: any): Promise<void>;
}
export default RealTrainingEngineImpl;
export declare function getRealTrainingEngine(): RealTrainingEngineImpl;
//# sourceMappingURL=RealTrainingEngineImpl.d.ts.map