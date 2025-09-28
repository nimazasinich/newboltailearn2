import * as tf from "@tensorflow/tfjs-node";
import Database from "better-sqlite3";
export interface ModelMetadata {
    id: string;
    name: string;
    type: string;
    accuracy: number;
    loss: number;
    epochs: number;
    vocabSize: number;
    maxLen: number;
    numClasses: number;
    createdAt: string;
    updatedAt: string;
    filePath: string;
    tokenizerPath: string;
    createdBy?: number;
}
export interface SaveModelOptions {
    modelId: string;
    modelName: string;
    modelType: string;
    accuracy: number;
    loss: number;
    epochs: number;
    vocabSize: number;
    maxLen: number;
    numClasses: number;
    createdBy?: number;
}
export declare class ModelPersistence {
    private modelsDir;
    private db;
    constructor(database: Database.Database, modelsDir?: string);
    private ensureModelsDirectory;
    /**
     * Save a trained model to filesystem and database
     */
    saveModel(model: tf.LayersModel, tokenizer: any, options: SaveModelOptions): Promise<ModelMetadata>;
    /**
     * Load a model from filesystem
     */
    loadModel(modelId: string): Promise<{
        model: tf.LayersModel;
        tokenizer: any;
        metadata: ModelMetadata;
    }>;
    /**
     * List all saved models
     */
    listModels(): ModelMetadata[];
    /**
     * Delete a model from filesystem and database
     */
    deleteModel(modelId: string): Promise<boolean>;
    /**
     * Get model metadata by ID
     */
    getModelMetadata(modelId: string): ModelMetadata | null;
    /**
     * Update model metadata
     */
    updateModelMetadata(modelId: string, updates: Partial<{
        name: string;
        accuracy: number;
        loss: number;
        epochs: number;
    }>): boolean;
    /**
     * Check if model exists
     */
    modelExists(modelId: string): boolean;
    /**
     * Get model file path
     */
    getModelPath(modelId: string): string | null;
}
//# sourceMappingURL=ModelPersistence.d.ts.map