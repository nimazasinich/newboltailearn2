import * as tf from '@tensorflow/tfjs-node';
export interface TrainingConfig {
    modelType: 'persian-bert' | 'dora' | 'qr-adaptor';
    datasets: string[];
    epochs: number;
    batchSize: number;
    learningRate: number;
    validationSplit: number;
    maxSequenceLength: number;
    vocabSize: number;
}
export interface TrainingCallbacks {
    onProgress?: (progress: any) => void;
    onMetrics?: (metrics: any) => void;
    onComplete?: (model: any) => void;
    onError?: (error: string) => void;
}
export declare class TrainingEngine {
    private model;
    private modelType;
    private isTestEnvironment;
    constructor();
    initializeModel(config: TrainingConfig): Promise<void>;
    private createMockPersianBERT;
    private createMockDoRAAdapter;
    private createMockQRAdaptor;
    private loadRealPersianBERT;
    private loadRealDoRAAdapter;
    private loadRealQRAdaptor;
    getModel(): tf.LayersModel | null;
    startTraining(config: TrainingConfig, callbacks: TrainingCallbacks): Promise<void>;
    stopTraining(): void;
    saveModel(checkpointPath: string): Promise<void>;
    private saveRealModel;
    loadModel(checkpointPath: string): Promise<void>;
    dispose(): void;
    private generateMockTrainingData;
}
//# sourceMappingURL=TrainingEngine.d.ts.map