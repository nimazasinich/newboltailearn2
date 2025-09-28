import { ModelPersistence } from "../services/ModelPersistence";
export type LabeledSample = {
    text: string;
    label: number;
};
export interface TrainOptions {
    epochs: number;
    batchSize?: number;
    learningRate?: number;
    validationSplit?: number;
    modelId?: string;
    modelName?: string;
    modelType?: string;
    saveModel?: boolean;
    createdBy?: number;
    onProgress?: (p: {
        epoch: number;
        loss: number;
        accuracy?: number;
        val_loss?: number;
        val_accuracy?: number;
    }) => void;
    onComplete?: (modelId?: string) => void;
    onError?: (err: string) => void;
}
export declare class RealTrainingEngine {
    private model;
    private tokenizer;
    private maxLen;
    private modelPersistence;
    constructor(modelPersistence?: ModelPersistence);
    /** معماری سبک و واقعی برای طبقه‌بندی متن */
    private buildModel;
    private toTensors;
    private toTensorsFromEncoded;
    private ensureDir;
    trainOnSamples(samples: LabeledSample[], opts: TrainOptions & {
        numClasses: number;
        checkpointDir?: string;
        saveEveryNEpochs?: number;
    }): Promise<void>;
    stopTraining(): void;
    dispose(): void;
}
//# sourceMappingURL=RealTrainingEngine.d.ts.map